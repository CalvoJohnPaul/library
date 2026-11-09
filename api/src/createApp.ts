import fs from 'node:fs';
import path from 'node:path';
import autoload, {type AutoloadPluginOptions} from '@fastify/autoload';
import cors, {type FastifyCorsOptions} from '@fastify/cors';
import csrf, {type FastifyCsrfProtectionOptions} from '@fastify/csrf-protection';
import helmet, {type FastifyHelmetOptions} from '@fastify/helmet';
import rateLimit, {type FastifyRateLimitOptions} from '@fastify/rate-limit';
import schedule from '@fastify/schedule';
import session, {type SecureSessionPluginOptions} from '@fastify/secure-session';
import sensible, {type FastifySensibleOptions} from '@fastify/sensible';
import swagger, {type FastifyDynamicSwaggerOptions} from '@fastify/swagger';
import swaggerUi, {type FastifySwaggerUiOptions} from '@fastify/swagger-ui';
import {get} from 'es-toolkit/compat';
import type {FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions} from 'fastify';
import fastify from 'fastify';
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod';
import type {ToadSchedulerOptions} from 'toad-scheduler';
import * as z from 'zod';
import {Prisma} from '../prisma/.generated/client';
import {reserveBookJob} from './jobs/reserveBook';
import {unreserveBookJob} from './jobs/unreserveBook';
import {ExcelWorkbookDefinition} from './types';

z.globalRegistry.add(ExcelWorkbookDefinition, {
	type: 'string',
	format: 'binary',
});

export const options: FastifyServerOptions = {
	logger: {
		enabled: true,
		level: process.env.NODE_ENV === 'development' ? 'info' : 'error',
		transport: {
			target: '@fastify/one-line-logger',
		},
	},
	trustProxy: false,
};

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
	transform: jsonSchemaTransform,
	openapi: {
		info: {
			title: 'Library API',
			description: 'API documentation for the library app',
			version: '0.0.1',
		},
	},
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
	routePrefix: '/',
};

export const sensibleOptions: FastifySensibleOptions = {};

export const corsOptions: FastifyCorsOptions = {
	origin: [
		'http://localhost',
		'http://localhost:3000',
		'http://localhost:5000',
		'http://127.0.0.1',
		'http://127.0.0.1:3000',
		'http://127.0.0.1:5000',
	],
	methods: ['HEAD', 'GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'QUERY'],
	credentials: true,
};

export const rateLimitOptions: FastifyRateLimitOptions = {
	global: true,
	timeWindow: 1000 * 60,
	max: 100,
	addHeaders: true,
	addHeadersOnExceeding: true,
};

export const helmetOptions: FastifyHelmetOptions = {
	global: true,
	crossOriginResourcePolicy: {
		policy: 'cross-origin',
	},
};

export const sessionOptions: SecureSessionPluginOptions = {
	key: fs.readFileSync(path.resolve('./session-key')),
	cookie: {
		path: '/',
		maxAge: 60 * 60 * 24 /* 1d */,
		secure: process.env.NODE_ENV === 'production',
		signed: true,
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		httpOnly: true,
	},
};

export const csrfOptions: FastifyCsrfProtectionOptions = {
	sessionPlugin: '@fastify/secure-session',
};

export const autoloadOptions_0: AutoloadPluginOptions = {
	dir: path.join(__dirname, 'plugins'),
	options,
};

export const autoloadOptions_1: AutoloadPluginOptions = {
	dir: path.join(__dirname, 'routes'),
	options,
};

export const scheduleOptions: ToadSchedulerOptions = {};

export function handleError(error: unknown, request: FastifyRequest, reply: FastifyReply) {
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

	const suppliedStatus = get(error, 'statusCode');
	const statusCode =
		typeof suppliedStatus === 'number' &&
		Number.isInteger(suppliedStatus) &&
		suppliedStatus >= 400 &&
		suppliedStatus <= 599
			? suppliedStatus
			: 500;

	let name: string;
	let message: string;

	if (statusCode >= 500) {
		request.log.error({err: error, requestId: request.id}, 'Request failed');
		name = map_0[500];
		message = map_1[500];
	} else if (error instanceof Error) {
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
}

export async function createApp(): Promise<FastifyInstance> {
	const app = fastify(options);

	app.setErrorHandler(handleError);
	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

	await app.register(swagger, swaggerOptions);
	await app.register(swaggerUi, swaggerUiOptions);
	await app.register(sensible, sensibleOptions);
	await app.register(cors, corsOptions);
	await app.register(rateLimit, rateLimitOptions);
	await app.register(helmet, helmetOptions);
	await app.register(session, sessionOptions);
	await app.register(csrf, csrfOptions);
	await app.register(autoload, autoloadOptions_0);
	await app.register(autoload, autoloadOptions_1);
	await app.register(schedule, scheduleOptions);

	app.scheduler.addSimpleIntervalJob(unreserveBookJob);
	app.scheduler.addSimpleIntervalJob(reserveBookJob);

	return app;
}

declare module '@fastify/secure-session' {
	interface SessionData {
		token: string;
	}
}
