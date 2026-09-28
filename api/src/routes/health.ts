import {VoidSuccessfulHttpResponseDefinition} from '@library/types';
import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/',
		{
			schema: {
				tags: ['Health'],
				response: {
					200: VoidSuccessfulHttpResponseDefinition,
				},
			},
		},
		async (_req, reply) => {
			return reply.send({ok: true});
		},
	);
};

export const autoPrefix = '/health';
export default plugin;
