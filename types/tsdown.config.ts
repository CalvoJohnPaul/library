import {defineConfig, mergeConfig} from 'tsdown';

export default defineConfig((config) => {
	return mergeConfig(config, {
		entry: ['./src/**/*.ts'],
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
