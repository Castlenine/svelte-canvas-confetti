import { sveltekit } from '@sveltejs/kit/vite';

import { defineConfig } from 'vite';

const CONFIG = defineConfig({
	plugins: [sveltekit()],
});

export default CONFIG;
