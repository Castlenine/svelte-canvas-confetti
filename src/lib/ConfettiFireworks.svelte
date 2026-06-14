<!--
@component
Fireworks confetti effect. Launches rocket particles upward that explode into confetti bursts at their peak. Supports multiple staggered fireworks.

&nbsp;

@prop styles {readonly ParticleStyle[]} [undefined] - Render styles for burst confetti. Valid HTML colors, HTMLImageElement, or CanvasImageSource.
@prop count {number} [3] - Number of fireworks to launch.
@prop particleCount {number} [40] - Number of particles per burst explosion.
@prop rocketStyles {readonly ParticleStyle[]} [['whitesmoke']] - Render styles for rocket trail particles.
@prop burstForce {number} [12] - Burst explosion velocity. Higher = faster/further.
@prop launchForce {number} [25] - Upward launch velocity of the rocket.
@prop staggerDelay {number} [400] - Delay in milliseconds between firework launches.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial burst particle values at creation time.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per burst particle for custom animation logic.
@prop onCompleted {() => void} [undefined] - Callback fired when all fireworks (rockets and bursts) have finished.
-->

<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, Particle, ParticleStyle, Position } from '$lib/utils/types';

	import { onMount } from 'svelte';

	import Confetti from '$lib/Confetti.svelte';
	import { random } from '$lib/utils/random';

	type FireworkPhase = 'waiting' | 'rocket' | 'burst' | 'done';

	interface FireworkState {
		id: number;
		phase: FireworkPhase;
		launchOrigin: Position;
		burstOrigin: Position | undefined;
	}

	interface Props {
		styles?: readonly ParticleStyle[];
		count?: number;
		particleCount?: number;
		rocketStyles?: readonly ParticleStyle[];
		burstForce?: number;
		launchForce?: number;
		staggerDelay?: number;
		onCreate?: OnCreateParticle;
		onUpdate?: OnUpdateParticle;
		onCompleted?: () => void;
	}

	const {
		styles = undefined,
		count = 3,
		particleCount = 40,
		rocketStyles = ['whitesmoke'] as readonly ParticleStyle[],
		burstForce = 12,
		launchForce = 25,
		staggerDelay = 400,
		onCreate = undefined,
		onUpdate = undefined,
		onCompleted,
	}: Props = $props();

	let fireworks: FireworkState[] = $state([]);
	let idCounter = 0;

	function transitionFirework(fireworkId: number, phase: FireworkPhase, burstOrigin?: Position): void {
		fireworks = fireworks.map((fw) =>
			fw.id === fireworkId ? { ...fw, phase, burstOrigin: burstOrigin ?? fw.burstOrigin } : fw,
		);

		if (phase === 'done') {
			const IS_ALL_DONE = fireworks.every((fw) => fw.id === fireworkId || fw.phase === 'done');

			if (IS_ALL_DONE) onCompleted?.();
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

		if (FIREWORK?.phase === 'rocket') {
			transitionFirework(fireworkId, 'burst', FIREWORK.launchOrigin);
		}
	}

	function handleBurstCompleted(fireworkId: number): void {
		transitionFirework(fireworkId, 'done');
	}

	onMount(() => {
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
			onCompleted={() => handleRocketCompleted(firework.id)}
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
			onCompleted={() => handleBurstCompleted(firework.id)}
			{onCreate}
			{onUpdate} />
	{/if}
{/each}
