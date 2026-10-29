import * as p from '@clack/prompts';
import {PrismaPg} from '@prisma/adapter-pg';
import {hash} from 'bcrypt';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import * as z from 'zod';
import {PrismaClient} from '../prisma/.generated/client';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = new PrismaClient({adapter});
const nameDef = z
	.string()
	.trim()
	.min(4, 'Name must be 4 or more characters')
	.max(50, 'Name must not be more than 50 characters');
const emailDef = z.email();
const passwordDef = z
	.string()
	.trim()
	.min(8, 'Password must be 8 or more characters')
	.max(50, 'Password must not be more than 50 characters');

async function createAdmin() {
	p.intro('Create account');

	const args = await yargs(hideBin(process.argv))
		.option('name', {
			type: 'string',
		})
		.option('email', {
			type: 'string',
		})
		.option('password', {
			type: 'string',
		})
		.strict()
		.parse();

	const provided = z
		.object({
			name: nameDef.optional(),
			email: emailDef.optional(),
			password: passwordDef.optional(),
		})
		.safeParse(args);

	if (!provided.success) {
		for (const issue of provided.error.issues) {
			p.log.error(`${String(issue.path[0])}: ${issue.message}`);
		}

		process.exitCode = 1;
		return;
	}

	const {name, email, password} = await p.group(
		{
			name: () =>
				args.name !== undefined
					? Promise.resolve(args.name)
					: p.text({
							message: 'Enter name',
							validate: (v) => nameDef.safeParse(v).error?.issues.at(0)?.message,
						}),
			email: () =>
				args.email !== undefined
					? Promise.resolve(args.email)
					: p.text({
							message: 'Enter email',
							validate: (v) => emailDef.safeParse(v).error?.issues.at(0)?.message,
						}),
			password: () =>
				args.password !== undefined
					? Promise.resolve(args.password)
					: p.text({
							message: 'Enter password',
							validate: (v) => passwordDef.safeParse(v).error?.issues.at(0)?.message,
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
