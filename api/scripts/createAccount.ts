import * as p from '@clack/prompts';
import {PrismaPg} from '@prisma/adapter-pg';
import {hash} from 'bcrypt';
import * as z from 'zod';
import {PrismaClient} from '../prisma/.generated/client';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});

async function createAdmin() {
	p.intro('Create account');

	const {name, email, password} = await p.group(
		{
			name: () =>
				p.text({
					message: 'Enter name',
					validate: (v) =>
						z
							.string()
							.trim()
							.min(4, 'Name must be 4 or more characters')
							.max(50, 'Name must not be more than 50 characters')
							.safeParse(v)
							.error?.issues.at(0)?.message,
				}),
			email: () =>
				p.text({
					message: 'Enter email',
					validate: (v) => z.email().safeParse(v).error?.issues.at(0)?.message,
				}),
			password: () =>
				p.text({
					message: 'Enter password',
					validate: (v) =>
						z
							.string()
							.trim()
							.min(8, 'Password must be 8 or more characters')
							.max(50, 'Password must not be more than 50 characters')
							.safeParse(v)
							.error?.issues.at(0)?.message,
				}),
		},
		{
			onCancel() {
				p.cancel('Cancelled');
				process.exit(0);
			},
		},
	);

	const spinner = p.spinner();

	spinner.start('Creating account');

	try {
		await prisma.account.create({
			data: {
				name,
				email,
				password: await hash(password, 10),
			},
		});

		p.outro('Account created successfully');
	} catch (e) {
		p.log.error(JSON.stringify(e, null, 2));
		p.outro('Failed to create account');
	} finally {
		spinner.stop();
	}
}

createAdmin();
