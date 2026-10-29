import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {'@library/types': fileURLToPath(new URL('../types/src/index.ts', import.meta.url))},
	},
	test: {
		watch: false,
		include: ['tests/**/*.test.ts'],
		typecheck: {
			enabled: true,
		},
	},
});
