import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
	plugins: [react(), tailwind()],
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		open: true,
		port: 5000,
	},
	preview: {
		port: 5000,
		open: true,
	},
});
