import {
	CreateSessionInputDefinition,
	FailedHttpResponseDefinition,
	VoidSuccessfulHttpResponseDefinition,
} from '@library/types';
import {compare} from 'bcrypt';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import * as z from 'zod';

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.post(
		'/sessions',
		{
			onRequest: [app.csrfProtection],
			schema: {
				tags: ['Session'],
				body: CreateSessionInputDefinition,
				response: {
					201: VoidSuccessfulHttpResponseDefinition,
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
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
				},
			});

			const exists = account?.password && (await compare(req.body.password, account.password));

			if (!exists) return reply.unauthorized('Account not found');

			req.session.set('account', account.id);

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
			req.session.delete();

			return reply.send({ok: true});
		},
	);
};

export default plugin;
