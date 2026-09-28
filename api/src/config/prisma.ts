import {PrismaPg} from '@prisma/adapter-pg';
import {Prisma, PrismaClient} from '../../prisma/.generated/client';

export const prisma = new PrismaClient({
	adapter: new PrismaPg({
		connectionString: process.env.DATABASE_URL,
	}),
}).$extends({
	model: {
		$allModels: {
			async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']) {
				// biome-ignore lint/complexity/noBannedTypes: ""
				const context = Prisma.getExtensionContext(this) as unknown as {findFirst: Function};
				const result = await context.findFirst({where});
				return result !== null;
			},
		},
	},
});
