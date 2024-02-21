import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {comlink} from "vite-plugin-comlink";

export default defineConfig({
	plugins: [
		comlink(),
		react(),
	],
	worker: {
		plugins: () => ([
			comlink()
		])
	},
	server: {
		port: 3000,
		strictPort: true
	}
});