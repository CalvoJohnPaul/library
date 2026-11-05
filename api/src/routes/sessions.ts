import {
	CreateSessionInputDefinition,
	FailedHttpResponseDefinition,
	VoidSuccessfulHttpResponseDefinition,
} from '@library/types';
import {compare} from 'bcrypt';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import * as z from 'zod';
import {createSession, sessionId} from '../helpers/session';

const plugin: FastifyPluginAsyncZod = async (app) => {
	const accountLimit = app.createRateLimit({
		max: 5,
		timeWindow: '15 minutes',
		keyGenerator: (req) => {
			const body = req.body as z.infer<typeof CreateSessionInputDefinition>;
			return sessionId(body.email.toLowerCase());
		},
	});

	app.post(
		'/sessions',
		{
			onRequest: [app.csrfProtection],
			preHandler: [
				async (req, reply) => {
					const limit = await accountLimit(req);
					if (!limit.isAllowed && limit.isExceeded) {
						reply.header('retry-after', limit.ttlInSeconds);
						return reply.tooManyRequests('Too many login attempts. Please try again later.');
					}
				},
			],
			config: {rateLimit: {max: 10, timeWindow: '1 minute'}},
			schema: {
				tags: ['Session'],
				body: CreateSessionInputDefinition,
				response: {
					201: VoidSuccessfulHttpResponseDefinition,
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					429: FailedHttpResponseDefinition,
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		async (req, reply) => {
			const account = await app.prisma.account.findUnique({
				where: {
					email: req.body.email,
				},
				select: {
					id: true,
					password: true,
					sessionVersion: true,
				},
			});

			const exists = account?.password && (await compare(req.body.password, account.password));

			if (!exists) return reply.unauthorized('Account not found');

			const token = await app.prisma.$transaction(async (tx) => {
				await tx.session.deleteMany({where: {expiresAt: {lte: new Date()}}});
				const previous = req.session.get('token');
				if (typeof previous === 'string') {
					await tx.session.deleteMany({where: {id: sessionId(previous)}});
				}
				return createSession(tx, account);
			});
			req.session.set('token', token);
			req.session.touch();

			return reply.code(201).send({ok: true});
		},
	);

	app.delete(
		'/session',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Session'],
				response: {
					200: VoidSuccessfulHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		async (req, reply) => {
			const token = req.session.get('token');
			if (token) {
				await app.prisma.session.deleteMany({
					where: {id: sessionId(token), accountId: req.account.id},
				});
			}
			req.session.delete();

			return reply.send({ok: true});
		},
	);
};

export default plugin;
