<!--
@component
Full-screen canvas-based confetti renderer. Spawns particles on mount and animates them via `requestAnimationFrame` until all exit the viewport, then fires `onCompleted`. Used internally by `ConfettiBurst`, `ConfettiCannon`, and `FallingConfetti`.

All style types can be mixed freely in the same `styles` array. `HTMLCanvasElement` styles (from `createTextStyle`) and `HTMLImageElement` styles are automatically sized to match their dimensions. Image sizes can be overridden via `onCreate` — setting only one dimension (w or h) auto-scales the other to preserve the aspect ratio.

&nbsp;

@prop styles {readonly ParticleStyleEntry[]} [COLORS] - Render styles for confetti. Each particle gets a random value. Accepts plain styles (HTML colors, HTMLImageElement, CanvasImageSource) or config objects ({ style, w?, h? }) for per-style sizing. All types can be mixed.
@prop particleCount {number} [50] - Number of particles to create.
@prop origin {Position} [undefined] - Origin position [x, y]. If omitted, confetti falls from the top.
@prop force {number} [15] - Burst velocity. Higher = faster/further. No effect without origin.
@prop angle {number} [0] - Burst direction in degrees. Use with spread for directed bursts. No effect without origin.
@prop spread {number} [360] - Angular spread in degrees. Use with angle for directed bursts. No effect without origin.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial particle values at creation time.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per particle for custom animation logic.
@prop onCompleted {() => void} [undefined] - Callback fired when all particles have exited the screen.
-->

<script module lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, Particle, ParticleStyleEntry, Position } from '$lib/utils/types';

	import { COLORS } from '$lib/utils/constants';
	import { createParticle, isOutOfBounds, renderParticle, updateParticle } from '$lib/utils/particle';

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
		styles: readonly ParticleStyleEntry[];
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
	import { onMount } from 'svelte';

	interface Props {
		styles?: readonly ParticleStyleEntry[];
		particleCount?: number;
		origin?: Position;
		force?: number;
		angle?: number;
		spread?: number;
		onCreate?: OnCreateParticle;
		onUpdate?: OnUpdateParticle;
		onCompleted?: () => void;
	}

	const {
		styles = COLORS,
		particleCount = 50,
		origin = undefined,
		force = 15,
		angle = 0,
		spread = 360,
		onCreate = undefined,
		onUpdate = undefined,
		onCompleted,
	}: Props = $props();

	let canvasWidth: number = $state(0);
	let canvasHeight: number = $state(0);
	let canvas: HTMLCanvasElement;

	onMount(() => {
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		return start({
			canvas,
			onCompleted: () => onCompleted?.(),
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
