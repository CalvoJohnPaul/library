import {createApp} from './createApp';

async function main() {
	try {
		const server = await createApp();

		await server.listen({
			port: process.env.PORT ? Number(process.env.PORT) : 8080,
			host: '0.0.0.0',
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
