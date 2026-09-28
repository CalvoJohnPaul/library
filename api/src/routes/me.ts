import {
	AccountDefinition,
	SuccessfulHttpResponseDefinition,
	UpdateAccountInputDefinition,
} from '@library/types';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';
import * as z from 'zod';

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
			const id = req.session.get('account');

			const data =
				id == null
					? null
					: await app.prisma.account.findUnique({
							where: {id},
							select: {
								id: true,
								name: true,
								email: true,
								dateTimeCreated: true,
								dateTimeUpdated: true,
							},
						});

			return reply.send({
				ok: true,
				data,
			});
		},
	);

	app.patch(
		'/me',
		{
			schema: {
				tags: ['Me'],
				body: UpdateAccountInputDefinition,
				response: {
					200: SuccessfulHttpResponseDefinition(AccountDefinition),
				},
				headers: z.object({
					'x-csrf-token': z.string().nullable().optional(),
				}),
			},
		},
		() => {},
	);
};

export default plugin;
