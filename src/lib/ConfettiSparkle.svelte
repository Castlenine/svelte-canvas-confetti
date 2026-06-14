<!--
@component
Sparkle confetti effect. Particles appear at random positions across a defined area, twinkle with pulsing opacity, then fade out.

&nbsp;

@prop styles {readonly ParticleStyleEntry[]} [undefined] - Render styles for confetti. Accepts plain styles (HTML colors, HTMLImageElement, CanvasImageSource) or config objects ({ style, w?, h? }) for per-style sizing.
@prop particleCount {number} [40] - Number of sparkle particles to create.
@prop duration {number} [3] - Total effect duration in seconds.
@prop area {Position} [undefined] - [width, height] of the spawn area. Defaults to full viewport.
@prop areaOrigin {Position} [[0, 0]] - Top-left corner of the spawn area.
@prop sparkleSpeed {number} [2] - Twinkle frequency multiplier. Higher values produce faster pulsing.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial particle values at creation time. Chained after internal sparkle initialization.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per particle for custom animation logic. Chained after internal sparkle animation.
@callback on:completed {() => void} - Dispatched when all particles have finished their sparkle animation.
-->

<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, Particle, ParticleStyleEntry, Position } from '$lib/utils/types';

	import Confetti from '$lib/Confetti.svelte';
	import { random } from '$lib/utils/random';

	export let styles: readonly ParticleStyleEntry[] | undefined = undefined;
	export let particleCount = 40;
	export let duration = 3;
	export let area: Position | undefined = undefined;
	export let areaOrigin: Position = [0, 0];
	export let sparkleSpeed = 2;
	export let onCreate: OnCreateParticle | undefined = undefined;
	export let onUpdate: OnUpdateParticle | undefined = undefined;

	function handleCreate(p: Particle): Particle {
		if (!Number.isFinite(duration) || duration <= 0) {
			throw new Error('duration must be a finite positive number');
		}

		if (!Number.isFinite(sparkleSpeed) || sparkleSpeed <= 0) {
			throw new Error('sparkleSpeed must be a finite positive number');
		}

		const SPAWN_AREA_W = area ? area[0] : window.innerWidth;
		const SPAWN_AREA_H = area ? area[1] : window.innerHeight;
		const STAGGER_WINDOW = duration * 0.6;
		const HAS_EXPLICIT_SIZE =
			p.style instanceof HTMLCanvasElement || p.style instanceof HTMLImageElement || p.sizeConfigured;

		let particle: Particle = {
			...p,
			x: areaOrigin[0] + random(SPAWN_AREA_W),
			y: areaOrigin[1] + random(SPAWN_AREA_H),
			dx: 0,
			dy: 0,
			gy: 0,
			xw: 0,
			da: random(15, -15),
			delay: random(STAGGER_WINDOW),
			opacity: 0,
			w: HAS_EXPLICIT_SIZE ? p.w : random(8, 3),
			h: HAS_EXPLICIT_SIZE ? p.h : random(8, 3),
		};

		if (onCreate) particle = onCreate(particle);

		return particle;
	}

	function handleUpdate(p: Particle, dt: number): void {
		const ELAPSED = p.life - p.delay;

		if (ELAPSED >= 0) {
			const REMAINING = duration - p.life;

			p.opacity = Math.abs(Math.sin(ELAPSED * sparkleSpeed * Math.PI));

			if (REMAINING < 0.5) p.opacity *= Math.max(REMAINING / 0.5, 0);
			if (p.life >= duration) p.dead = true;
		}

		onUpdate?.(p, dt);
	}
</script>

<Confetti {particleCount} {styles} on:completed onCreate={handleCreate} onUpdate={handleUpdate} />
