import type {FastifyInstance} from 'fastify';
import fp from 'fastify-plugin';
import type {Account} from '../../prisma/.generated/client';
import {sessionId} from '../helpers/session';

type AuthAccount = Pick<Account, 'id' | 'name' | 'email' | 'dateTimeCreated' | 'dateTimeUpdated'>;

export default fp(
	async (fastify: FastifyInstance): Promise<void> => {
		fastify.decorate('getAuthAccount', async (request) => {
			const token = request.session.get('token');
			if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null;

			const session = await fastify.prisma.session.findUnique({
				where: {id: sessionId(token)},
				select: {
					expiresAt: true,
					accountVersion: true,
					account: {
						select: {
							id: true,
							name: true,
							email: true,
							dateTimeCreated: true,
							dateTimeUpdated: true,
							sessionVersion: true,
						},
					},
				},
			});

			if (
				!session ||
				session.expiresAt <= new Date() ||
				session.accountVersion !== session.account.sessionVersion
			) {
				return null;
			}

			const {sessionVersion: _, ...account} = session.account;
			return account;
		});

		fastify.decorate('verifyAuth', async (request, reply) => {
			const account = await fastify.getAuthAccount(request);

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
		getAuthAccount(req: FastifyRequest): Promise<AuthAccount | null>;
		verifyAuth(req: FastifyRequest, reply: FastifyReply, done: () => void): void;
	}

	interface FastifyRequest {
		account: AuthAccount;
	}
}
