import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/',
		{
			schema: {
				tags: ['Students'],
				response: {},
			},
		},
		async () => {},
	);

	app.get(
		'/:id',
		{
			schema: {
				tags: ['Students'],
				response: {},
			},
		},
		async () => {},
	);

	app.post(
		'/',
		{
			schema: {
				tags: ['Students'],
				response: {},
			},
		},
		async () => {},
	);

	app.patch(
		'/:id',
		{
			schema: {
				tags: ['Students'],
				response: {},
			},
		},
		async () => {},
	);
};

export const autoPrefix = '/students';
export default plugin;
