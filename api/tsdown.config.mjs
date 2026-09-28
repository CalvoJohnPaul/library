// @ts-check
import {defineConfig} from 'tsdown';

export default defineConfig({
	entry: ['src/**/*.ts'],
	clean: true,
	outDir: 'dist',
	format: 'cjs',
	minify: true,
	logLevel: 'silent',
	sourcemap: true,
	nodeProtocol: true,
});
