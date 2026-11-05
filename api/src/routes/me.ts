import {
	AccountDefinition,
	FailedHttpResponseDefinition,
	SuccessfulHttpResponseDefinition,
	UpdateAccountInputDefinition,
} from '@library/types';
import {compare, hash} from 'bcrypt';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import * as z from 'zod';
import {clean} from '../helpers/clean';
import {createSession} from '../helpers/session';

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/me',
		{
			schema: {
				tags: ['Me'],
				response: {
					200: SuccessfulHttpResponseDefinition(AccountDefinition.nullable()),
				},
			},
		},
		async (req, reply) => {
			const data = await app.getAuthAccount(req);

			return reply.send({
				ok: true,
				data,
			});
		},
	);

	app.patch(
		'/me',
		{
			onRequest: [app.csrfProtection],
			preHandler: [app.verifyAuth],
			schema: {
				tags: ['Me'],
				body: UpdateAccountInputDefinition,
				response: {
					200: SuccessfulHttpResponseDefinition(AccountDefinition),
					400: FailedHttpResponseDefinition,
					401: FailedHttpResponseDefinition,
					403: FailedHttpResponseDefinition,
					409: FailedHttpResponseDefinition,
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		async (req, reply) => {
			const id = req.account.id;

			const {newPassword, oldPassword, ...rest} = req.body;

			let password: string | undefined;

			if (newPassword != null && oldPassword != null) {
				const account = await app.prisma.account.findUnique({
					where: {id},
					select: {password: true},
				});

				if (!account?.password || !(await compare(oldPassword, account.password))) {
					return reply.forbidden('Invalid old password');
				}

				password = await hash(newPassword, 10);
			}

			const [account, token] = await app.prisma.$transaction(async (tx) => {
				const updated = await tx.account.update({
					where: {id},
					data: {
						...clean(rest),
						...(password != null && {password, sessionVersion: {increment: 1}}),
					},
					select: {
						id: true,
						name: true,
						email: true,
						dateTimeCreated: true,
						dateTimeUpdated: true,
						sessionVersion: true,
					},
				});
				if (password == null) return [updated, null] as const;
				await tx.session.deleteMany({where: {accountId: id}});
				return [updated, await createSession(tx, updated)] as const;
			});

			if (token != null) {
				req.session.set('token', token);
				req.session.touch();
			}

			return reply.send({
				ok: true,
				data: account,
			});
		},
	);
};

export default plugin;
