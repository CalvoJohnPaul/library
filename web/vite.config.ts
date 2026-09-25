import babel from '@rolldown/plugin-babel';
import tailwind from '@tailwindcss/vite';
import react, {reactCompilerPreset} from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
	plugins: [react(), babel({presets: [reactCompilerPreset()]}), tailwind()],
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		port: 80,
	},
	preview: {
		port: 80,
	},
});
