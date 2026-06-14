<!--
@component
Fireworks confetti effect. Launches rocket particles upward that explode into confetti bursts at their peak. Supports multiple staggered fireworks.

&nbsp;

@prop styles {readonly ParticleStyleEntry[]} [undefined] - Render styles for burst confetti. Accepts plain styles (HTML colors, HTMLImageElement, CanvasImageSource) or config objects ({ style, w?, h? }) for per-style sizing.
@prop count {number} [3] - Number of fireworks to launch.
@prop particleCount {number} [40] - Number of particles per burst explosion.
@prop rocketStyles {readonly ParticleStyleEntry[]} [['whitesmoke']] - Render styles for rocket trail particles. Config object sizes are overridden by the rocket's fixed 4x4 trail dimensions.
@prop burstForce {number} [12] - Burst explosion velocity. Higher = faster/further.
@prop launchForce {number} [25] - Upward launch velocity of the rocket.
@prop staggerDelay {number} [400] - Delay in milliseconds between firework launches.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial burst particle values at creation time.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per burst particle for custom animation logic.
@callback on:completed {() => void} - Dispatched when all fireworks (rockets and bursts) have finished.
-->

<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, Particle, ParticleStyleEntry, Position } from '$lib/utils/types';

	import { createEventDispatcher, onMount } from 'svelte';

	import Confetti from '$lib/Confetti.svelte';
	import { random } from '$lib/utils/random';

	type FireworkPhase = 'waiting' | 'rocket' | 'burst' | 'done';

	interface FireworkState {
		id: number;
		phase: FireworkPhase;
		launchOrigin: Position;
		burstOrigin: Position | undefined;
	}

	export let styles: readonly ParticleStyleEntry[] | undefined = undefined;
	export let count = 3;
	export let particleCount = 40;
	export let rocketStyles: readonly ParticleStyleEntry[] = ['whitesmoke'];
	export let burstForce = 12;
	export let launchForce = 25;
	export let staggerDelay = 400;
	export let onCreate: OnCreateParticle | undefined = undefined;
	export let onUpdate: OnUpdateParticle | undefined = undefined;

	const dispatch = createEventDispatcher<{ completed: null }>();

	let fireworks: FireworkState[] = [];
	let idCounter = 0;

	function transitionFirework(fireworkId: number, phase: FireworkPhase, burstOrigin?: Position): void {
		fireworks = fireworks.map((fw) =>
			fw.id === fireworkId ? { ...fw, phase, burstOrigin: burstOrigin ?? fw.burstOrigin } : fw,
		);

		switch (phase) {
			case 'waiting':
			case 'rocket':
			case 'burst':
				break;

			case 'done': {
				const IS_ALL_DONE = fireworks.every((fw) => fw.id === fireworkId || fw.phase === 'done');

				if (IS_ALL_DONE) dispatch('completed');
				break;
			}

			default:
				throw new Error(`Unhandled firework phase: "${phase as string}"`);
		}
	}

	function createRocketOnCreate(): OnCreateParticle {
		let isFirstParticle = true;

		return (p: Particle): Particle => {
			const DELAY = isFirstParticle ? 0 : random(0.15);
			isFirstParticle = false;

			return {
				...p,
				dx: random(2, -2),
				dy: -(launchForce + random(5)),
				gy: random(5, 3),
				w: 4,
				h: 4,
				da: 0,
				xw: 0,
				delay: DELAY,
			};
		};
	}

	function createRocketOnUpdate(fireworkId: number): OnUpdateParticle {
		let hasPeaked = false;

		return (p: Particle): void => {
			if (!hasPeaked && p.dy >= 0) {
				hasPeaked = true;
				const PEAK_POSITION: Position = [p.x, p.y];
				p.dead = true;
				transitionFirework(fireworkId, 'burst', PEAK_POSITION);
			}
		};
	}

	function handleRocketCompleted(fireworkId: number): void {
		const FIREWORK = fireworks.find((fw) => fw.id === fireworkId);

		if (!FIREWORK) {
			throw new Error(`Firework with id ${String(fireworkId)} not found`);
		}

		if (FIREWORK.phase === 'rocket') {
			transitionFirework(fireworkId, 'burst', FIREWORK.launchOrigin);
		}
	}

	function handleBurstCompleted(fireworkId: number): void {
		transitionFirework(fireworkId, 'done');
	}

	onMount(() => {
		if (!Number.isInteger(count) || count <= 0) {
			throw new Error('count must be a positive integer');
		}

		if (!Number.isFinite(staggerDelay) || staggerDelay < 0) {
			throw new Error('staggerDelay must be a non-negative number');
		}

		const VIEWPORT_W = window.innerWidth;
		const LAUNCH_W = VIEWPORT_W * 0.6;
		const LAUNCH_X_OFFSET = (VIEWPORT_W - LAUNCH_W) / 2;

		const INITIAL_FIREWORKS: FireworkState[] = Array.from({ length: count }, (_, index) => ({
			id: idCounter++,
			phase: index === 0 ? ('rocket' as const) : ('waiting' as const),
			launchOrigin: [LAUNCH_X_OFFSET + random(LAUNCH_W), window.innerHeight] as Position,
			burstOrigin: undefined,
		}));

		fireworks = INITIAL_FIREWORKS;

		const TIMEOUT_IDS = INITIAL_FIREWORKS.slice(1).map((firework, index) =>
			window.setTimeout(
				() => {
					transitionFirework(firework.id, 'rocket');
				},
				(index + 1) * staggerDelay,
			),
		);

		return () => {
			TIMEOUT_IDS.forEach((id) => window.clearTimeout(id));
		};
	});
</script>

{#each fireworks as firework (firework.id)}
	{#if firework.phase === 'rocket'}
		<Confetti
			angle={-90}
			force={launchForce}
			origin={firework.launchOrigin}
			particleCount={5}
			spread={10}
			styles={rocketStyles}
			on:completed={() => handleRocketCompleted(firework.id)}
			onCreate={createRocketOnCreate()}
			onUpdate={createRocketOnUpdate(firework.id)} />
	{/if}

	{#if firework.phase === 'burst' && firework.burstOrigin}
		<Confetti
			force={burstForce}
			origin={firework.burstOrigin}
			{particleCount}
			spread={360}
			{styles}
			on:completed={() => handleBurstCompleted(firework.id)}
			{onCreate}
			{onUpdate} />
	{/if}
{/each}
