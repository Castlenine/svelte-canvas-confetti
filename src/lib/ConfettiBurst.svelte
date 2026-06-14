<!--
@component
Confetti burst effect. Spawns particles from a single origin point that explode outward in all directions (360° spread).

&nbsp;

@prop origin {Position} - Origin position [x, y] of the confetti burst. Required.
@prop styles {readonly ParticleStyleEntry[]} [undefined] - Render styles for confetti. Accepts plain styles (HTML colors, HTMLImageElement, CanvasImageSource) or config objects ({ style, w?, h? }) for per-style sizing.
@prop particleCount {number} [50] - Number of particles to create.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial particle values at creation time.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per particle for custom animation logic.
@prop onCompleted {() => void} [undefined] - Callback fired when all particles have exited the screen.
-->

<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, ParticleStyleEntry, Position } from '$lib/utils/types';

	import Confetti from '$lib/Confetti.svelte';

	interface Props {
		origin: Position;
		styles?: readonly ParticleStyleEntry[];
		particleCount?: number;
		onCreate?: OnCreateParticle;
		onUpdate?: OnUpdateParticle;
		onCompleted?: () => void;
	}

	const {
		origin,
		styles = undefined,
		particleCount = 50,
		onCreate = undefined,
		onUpdate = undefined,
		onCompleted,
	}: Props = $props();
</script>

<Confetti {origin} {particleCount} {styles} {onCompleted} {onCreate} {onUpdate} />
