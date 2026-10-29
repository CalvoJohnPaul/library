import {createApp} from './createApp';

async function main() {
	try {
		const app = await createApp();
		const host = process.env.HOST?.trim() ?? null;
		const port = process.env.PORT?.trim() ? Number.parseInt(process.env.PORT, 10) : null;

		await app.listen({
			host: host || '0.0.0.0',
			port: port && !Number.isNaN(port) ? port : 8080,
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}
