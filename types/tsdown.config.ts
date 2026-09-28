import {defineConfig, mergeConfig} from 'tsdown';

export default defineConfig((config) => {
	return mergeConfig(config, {
		entry: ['./src/index.ts'],
		shims: true,
		format: ['esm', 'cjs'],
		outDir: 'dist',
		fixedExtension: false,
		dts: {
			build: true,
		},
		deps: {
			neverBundle: true,
		},
	});
});
