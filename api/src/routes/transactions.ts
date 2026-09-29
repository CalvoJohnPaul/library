import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/',
		{
			schema: {
				tags: ['Transactions'],
				response: {},
			},
		},
		async () => {},
	);

	app.get(
		'/:id',
		{
			schema: {
				tags: ['Transactions'],
				response: {},
			},
		},
		async () => {},
	);
};

export const autoPrefix = '/transactions';
export default plugin;
