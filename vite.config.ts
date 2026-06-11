import type { UserConfig } from 'vite';

import { sveltekit } from '@sveltejs/kit/vite';

const CONFIG: UserConfig = {
	plugins: [sveltekit()],
};

export default CONFIG;
