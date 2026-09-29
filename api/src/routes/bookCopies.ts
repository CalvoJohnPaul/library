import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod';

const plugin: FastifyPluginAsyncZod = async (app) => {
	app.get(
		'/',
		{
			schema: {
				tags: ['Book Copies'],
				response: {},
			},
		},
		async () => {},
	);

	app.get(
		'/:id',
		{
			schema: {
				tags: ['Book Copies'],
				response: {},
			},
		},
		async () => {},
	);

	app.post(
		'/',
		{
			schema: {
				tags: ['Book Copies'],
				response: {},
			},
		},
		async () => {},
	);

	app.patch(
		'/:id',
		{
			schema: {
				tags: ['Book Copies'],
				response: {},
			},
		},
		async () => {},
	);

	app.delete(
		'/:id',
		{
			schema: {
				tags: ['Book Copies'],
				response: {},
			},
		},
		async () => {},
	);

	app.post(
		'/:id/borrow',
		{
			schema: {
				tags: ['Book Copies'],
				response: {},
			},
		},
		async () => {},
	);

	app.post(
		'/:id/return',
		{
			schema: {
				tags: ['Book Copies'],
				response: {},
			},
		},
		async () => {},
	);

	app.post(
		'/export',
		{
			schema: {
				tags: ['Book Copies'],
				response: {},
			},
		},
		async () => {},
	);
};

export const autoPrefix = '/book-copies';
export default plugin;
