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
import type {FastifyServerOptions} from 'fastify';
import fastify from 'fastify';
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod';

async function main() {
	const options: FastifyServerOptions = {
		logger: {
			enabled: process.env.NODE_ENV === 'development',
			transport: {
				target: '@fastify/one-line-logger',
			},
		},
		trustProxy: true,
	};

	try {
		const server = fastify(options);

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

		await server.listen({
			port: process.env.PORT ? Number(process.env.PORT) : 8080,
			host: '0.0.0.0',
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

main();

declare module '@fastify/secure-session' {
	interface SessionData {
		account: number;
	}
}
