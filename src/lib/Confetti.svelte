<!--
@component
Full-screen canvas-based confetti renderer. Spawns particles on mount and animates them via `requestAnimationFrame` until all exit the viewport, then fires `on:completed`. Used internally by `ConfettiBurst`, `ConfettiCannon`, and `FallingConfetti`.

&nbsp;

@prop styles {readonly ParticleStyle[]} [COLORS] - Render styles for confetti. Each particle gets a random value. Valid HTML colors or HTMLImageElement.
@prop particleCount {number} [50] - Number of particles to create.
@prop origin {Position} [undefined] - Origin position [x, y]. If omitted, confetti falls from the top.
@prop force {number} [15] - Burst velocity. Higher = faster/further. No effect without origin.
@prop angle {number} [0] - Burst direction in degrees. Use with spread for directed bursts. No effect without origin.
@prop spread {number} [360] - Angular spread in degrees. Use with angle for directed bursts. No effect without origin.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial particle values at creation time.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per particle for custom animation logic.
@callback on:completed {() => void} - Dispatched when all particles have exited the screen.
-->

<script lang="ts" context="module">
	import type { OnCreateParticle, OnUpdateParticle, Particle, ParticleStyle, Position } from './utils/types';

	import { COLORS } from './utils/constants';
	import { createParticle, isOutOfBounds, renderParticle, updateParticle } from './utils/particle';

	function renderParticles(context: CanvasRenderingContext2D, particles: Particle[]): void {
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);

		for (let index = 0; index < particles.length; ++index) {
			const PARTICLE = particles[index];

			if (!PARTICLE.dead && PARTICLE.life >= PARTICLE.delay) renderParticle(context, PARTICLE);
		}
	}

	/**
	 * @returns {boolean} Returns false if no more confettis on the screen.
	 */
	function updateParticles(
		context: CanvasRenderingContext2D,
		particles: Particle[],
		dt: number,
		onUpdate?: OnUpdateParticle,
	): boolean {
		const CW = context.canvas.width;
		const CH = context.canvas.height;
		let livingParticles = particles.length;

		for (let index = 0; index < particles.length; ++index) {
			const PARTICLE = particles[index];

			if (PARTICLE.dead) {
				livingParticles--;
			} else {
				updateParticle(PARTICLE, dt);

				if (isOutOfBounds(PARTICLE, CW, CH)) PARTICLE.dead = true;
				if (onUpdate) onUpdate(PARTICLE, dt);
			}
		}

		return livingParticles > 0;
	}

	interface StartOptions {
		canvas: HTMLCanvasElement;
		onCompleted: () => void;
		particleCount: number;
		origin: Position | undefined;
		force: number;
		angle: number;
		spread: number;
		styles: readonly ParticleStyle[];
		onCreate?: OnCreateParticle;
		onUpdate?: OnUpdateParticle;
	}

	function start(options: StartOptions): () => void {
		const { canvas, onCompleted, particleCount, origin, force, angle, spread, styles, onCreate, onUpdate } = options;

		if (particleCount <= 0) {
			throw new Error('particleCount must be a positive integer');
		}

		const MAYBE_CONTEXT = canvas.getContext('2d');

		if (!MAYBE_CONTEXT) {
			throw new Error('Failed to get canvas 2D context');
		}

		const CONTEXT: CanvasRenderingContext2D = MAYBE_CONTEXT;

		const PARTICLES: Particle[] = Array.from({ length: particleCount }, () =>
			createParticle({ context: CONTEXT, origin, force, angle, spread, styles, onCreate }),
		);

		let frameId: number;
		let timestamp: number;

		function run(currentTimestamp: number): void {
			renderParticles(CONTEXT, PARTICLES);
			const DT = Math.min((currentTimestamp - timestamp) / 1e3, 0.1);
			const STILL_RUNNING = updateParticles(CONTEXT, PARTICLES, DT, onUpdate);

			if (STILL_RUNNING) {
				timestamp = currentTimestamp;
				frameId = requestAnimationFrame(run);
			} else {
				onCompleted();
			}
		}

		timestamp = performance.now();
		frameId = requestAnimationFrame(run);

		return () => {
			cancelAnimationFrame(frameId);
		};
	}
</script>

<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let styles: readonly ParticleStyle[] = COLORS;
	export let particleCount = 50;
	export let origin: Position | undefined = undefined;
	export let force = 15;
	export let angle = 0;
	export let spread = 360;
	export let onCreate: OnCreateParticle | undefined = undefined;
	export let onUpdate: OnUpdateParticle | undefined = undefined;

	const Dispatch = createEventDispatcher<{ completed: null }>();

	let canvasWidth: number;
	let canvasHeight: number;
	let canvas: HTMLCanvasElement;

	onMount(() => {
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		return start({
			canvas,
			onCompleted: () => Dispatch('completed'),
			particleCount,
			origin,
			force,
			angle,
			spread,
			styles,
			onCreate,
			onUpdate,
		});
	});
</script>

<svelte:window bind:innerHeight={canvasHeight} bind:innerWidth={canvasWidth} />
<canvas width={canvasWidth} height={canvasHeight} bind:this={canvas}></canvas>

<style>
	canvas {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999999;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
