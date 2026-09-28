import {CsrfDefinition, SuccessfulHttpResponseDefinition} from '@library/types';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/',
		{
			schema: {
				tags: ['CSRF'],
				response: {
					200: SuccessfulHttpResponseDefinition(CsrfDefinition),
				},
			},
		},
		async (_req, reply) => {
			const token = reply.generateCsrf();

			return reply.send({
				ok: true,
				data: {token},
			});
		},
	);
};

export const autoPrefix = '/csrf';
export default plugin;
