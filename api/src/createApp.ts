import fs from 'node:fs/promises';
import path from 'node:path';
import autoload from '@fastify/autoload';
import cors from '@fastify/cors';
import csrf from '@fastify/csrf-protection';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import session from '@fastify/secure-session';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {get} from 'es-toolkit/compat';
import type {FastifyInstance, FastifyServerOptions} from 'fastify';
import fastify from 'fastify';
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod';
import * as z from 'zod';
import {Prisma} from '../prisma/.generated/client';
import {ExcelWorkbookDefinition} from './types';

z.globalRegistry.add(ExcelWorkbookDefinition, {
	type: 'string',
	format: 'binary',
});

export async function createApp(): Promise<FastifyInstance> {
	const options: FastifyServerOptions = {
		logger: {
			enabled: process.env.NODE_ENV === 'development',
			transport: {
				target: '@fastify/one-line-logger',
			},
		},
		trustProxy: true,
	};

	const server = fastify(options);

	server.setErrorHandler((error, _req, reply) => {
		const map_0: Record<number, string> = {
			400: 'BadRequestError',
			401: 'UnauthorizedError',
			403: 'ForbiddenError',
			404: 'NotFoundError',
			405: 'MethodNotAllowedError',
			409: 'ConflictError',
			413: 'PayloadTooLargeError',
			415: 'UnsupportedMediaTypeError',
			422: 'UnprocessableEntityError',
			429: 'TooManyRequestsError',
			500: 'InternalServerError',
		};

		const map_1: Record<number, string> = {
			400: 'Invalid request.',
			401: 'You are not authorized to access this resource.',
			403: 'You do not have permission to access this resource.',
			404: 'Resource not found.',
			405: 'Method not allowed.',
			409: 'The request conflicts with the current state of the resource.',
			413: 'The request payload is too large.',
			415: 'The request media type is not supported.',
			422: 'The request could not be processed.',
			429: 'Too many requests. Please try again later.',
			500: 'An unexpected error occurred.',
		};

		const map_2: Record<
			string,
			{
				name: string;
				message: string;
				statusCode: number;
			}
		> = {
			P2002: {
				name: 'ConflictError',
				message: 'A record with this value already exists.',
				statusCode: 409,
			},
			P2003: {
				name: 'BadRequestError',
				message: 'A related record was not found.',
				statusCode: 400,
			},
			P2025: {
				name: 'NotFoundError',
				message: 'Record not found.',
				statusCode: 404,
			},
		};

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			const mapped = map_2[error.code];

			if (mapped) {
				return reply.code(mapped.statusCode).send({
					ok: false,
					error: {
						name: mapped.name,
						message: mapped.message,
					},
				});
			}
		}

		const statusCode = get(error, 'statusCode', 500);

		let name: string;
		let message: string;

		if (error instanceof Error) {
			name = error.name;
			message = error.message;
		} else {
			name = map_0[statusCode] ?? map_0[500];
			message = map_1[statusCode] ?? map_1[500];
		}

		reply.code(statusCode).send({
			ok: false,
			error: {
				name,
				message,
			},
		});
	});

	server.setValidatorCompiler(validatorCompiler);
	server.setSerializerCompiler(serializerCompiler);

	await server.register(swagger, {
		transform: jsonSchemaTransform,
		openapi: {
			info: {
				title: 'Library API',
				description: 'API documentation for the library app',
				version: '0.0.1',
			},
		},
	});

	await server.register(swaggerUi, {
		routePrefix: '/',
	});

	await server.register(cors, {
		origin: ['http://localhost', 'http://127.0.0.1'],
		methods: ['HEAD', 'GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
		credentials: true,
	});

	await server.register(sensible);

	/* @ts-expect-error */
	await server.register(rateLimit, {
		global: true,
		timeWindow: 1000 * 60,
		max: 100,
		addHeaders: true,
		addHeadersOnExceeding: true,
	});

	await server.register(helmet, {
		global: true,
		crossOriginResourcePolicy: {
			policy: 'cross-origin',
		},
	});

	await server.register(session, {
		key: await fs.readFile(path.resolve('./session-key')),
		cookie: {
			path: '/',
			maxAge: 60 * 60 * 24 /* 1d */,
			secure: process.env.NODE_ENV === 'production',
			signed: true,
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
			httpOnly: true,
		},
	});

	await server.register(csrf, {
		sessionPlugin: '@fastify/secure-session',
	});

	await server.register(autoload, {
		dir: path.join(__dirname, 'plugins'),
		options,
	});

	await server.register(autoload, {
		dir: path.join(__dirname, 'routes'),
		options,
	});

	return server;
}

declare module '@fastify/secure-session' {
	interface SessionData {
		account: number;
	}
}
