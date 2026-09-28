import type {FastifyInstance} from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (fastify: FastifyInstance): Promise<void> => {
		fastify.decorate('verifyAuth', async (request, reply) => {
			const id = request.session.get('account');
			const account = !id
				? null
				: await fastify.prisma.account.findUnique({
						where: {id},
						select: {id: true},
					});

			if (!account) return reply.unauthorized();

			request.account = account;
		});
	},
	{
		name: 'fastify-auth',
		fastify: '5.x',
		dependencies: ['fastify-prisma', '@fastify/secure-session'],
	},
);

declare module 'fastify' {
	interface FastifyInstance {
		verifyAuth(req: FastifyRequest, reply: FastifyReply, done: () => void): void;
	}

	interface FastifyRequest {
		account: {id: number};
	}
}
