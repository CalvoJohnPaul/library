import react, {reactCompilerPreset} from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import {defineConfig} from 'vite';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
	plugins: [react(), babel({presets: [reactCompilerPreset()]}), tailwind()],
	resolve: {
		tsconfigPaths: true,
	},
});
