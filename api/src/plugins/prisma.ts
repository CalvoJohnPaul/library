import type {FastifyInstance} from 'fastify';
import fp from 'fastify-plugin';
import {prisma} from '../config/prisma';

export default fp(
	async (fastify: FastifyInstance): Promise<void> => {
		await prisma.$connect();
		fastify.decorate('prisma', prisma);
		fastify.addHook('onClose', async (server) => {
			await server.prisma.$disconnect();
		});
	},
	{
		name: 'fastify-prisma',
		fastify: '5.x',
	},
);

declare module 'fastify' {
	interface FastifyInstance {
		prisma: typeof prisma;
	}
}
