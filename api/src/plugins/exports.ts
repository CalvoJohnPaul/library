import type {FastifyInstance} from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (app: FastifyInstance): Promise<void> => {
		const limitExport = app.createRateLimit({max: 5, timeWindow: '1 minute'});
		app.decorate('verifyExport', async (request, reply) => {
			const limit = await limitExport(request);
			if (!limit.isAllowed && limit.isExceeded) {
				reply.header('retry-after', limit.ttlInSeconds);
				return reply.tooManyRequests('Too many exports. Please try again later.');
			}
		});
	},
	{name: 'fastify-exports', fastify: '5.x', dependencies: ['@fastify/rate-limit']},
);

declare module 'fastify' {
	interface FastifyInstance {
		verifyExport(req: FastifyRequest, reply: FastifyReply): Promise<unknown>;
	}
}
