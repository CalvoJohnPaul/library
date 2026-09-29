import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/',
		{
			schema: {
				tags: ['Books'],
				response: {},
			},
		},
		async () => {},
	);

	app.get(
		'/:id',
		{
			schema: {
				tags: ['Books'],
				response: {},
			},
		},
		async () => {},
	);

	app.post(
		'/',
		{
			schema: {
				tags: ['Books'],
				response: {},
			},
		},
		async () => {},
	);

	app.patch(
		'/:id',
		{
			schema: {
				tags: ['Books'],
				response: {},
			},
		},
		async () => {},
	);

	app.delete(
		'/:id',
		{
			schema: {
				tags: ['Books'],
				response: {},
			},
		},
		async () => {},
	);
};

export const autoPrefix = '/books';
export default plugin;
