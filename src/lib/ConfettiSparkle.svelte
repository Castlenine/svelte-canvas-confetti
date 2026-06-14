<!--
@component
Sparkle confetti effect. Particles appear at random positions across a defined area, twinkle with pulsing opacity, then fade out.

&nbsp;

@prop styles {readonly ParticleStyle[]} [undefined] - Render styles for confetti. Valid HTML colors, HTMLImageElement, or CanvasImageSource.
@prop particleCount {number} [40] - Number of sparkle particles to create.
@prop duration {number} [3] - Total effect duration in seconds.
@prop area {Position} [undefined] - [width, height] of the spawn area. Defaults to full viewport.
@prop areaOrigin {Position} [[0, 0]] - Top-left corner of the spawn area.
@prop sparkleSpeed {number} [2] - Twinkle frequency multiplier. Higher values produce faster pulsing.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial particle values at creation time. Chained after internal sparkle initialization.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per particle for custom animation logic. Chained after internal sparkle animation.
@prop onCompleted {() => void} [undefined] - Callback fired when all particles have finished their sparkle animation.
-->

<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, Particle, ParticleStyle, Position } from '$lib/utils/types';

	import Confetti from '$lib/Confetti.svelte';
	import { random } from '$lib/utils/random';

	interface Props {
		styles?: readonly ParticleStyle[];
		particleCount?: number;
		duration?: number;
		area?: Position;
		areaOrigin?: Position;
		sparkleSpeed?: number;
		onCreate?: OnCreateParticle;
		onUpdate?: OnUpdateParticle;
		onCompleted?: () => void;
	}

	const {
		styles = undefined,
		particleCount = 40,
		duration = 3,
		area = undefined,
		areaOrigin = [0, 0] as Position,
		sparkleSpeed = 2,
		onCreate = undefined,
		onUpdate = undefined,
		onCompleted,
	}: Props = $props();

	function handleCreate(p: Particle): Particle {
		const SPAWN_AREA_W = area ? area[0] : window.innerWidth;
		const SPAWN_AREA_H = area ? area[1] : window.innerHeight;
		const STAGGER_WINDOW = duration * 0.6;
		const IS_SIZED_STYLE = p.style instanceof HTMLCanvasElement || p.style instanceof HTMLImageElement;

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
			w: IS_SIZED_STYLE ? p.w : random(8, 3),
			h: IS_SIZED_STYLE ? p.h : random(8, 3),
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

<Confetti {particleCount} {styles} {onCompleted} onCreate={handleCreate} onUpdate={handleUpdate} />
