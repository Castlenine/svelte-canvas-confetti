<!--
@component
Falling confetti effect. Particles spawn along the top edge of the viewport and drift downward with gravity and wind simulation.

&nbsp;

@prop styles {readonly ParticleStyleEntry[]} [undefined] - Render styles for confetti. Accepts plain styles (HTML colors, HTMLImageElement, CanvasImageSource) or config objects ({ style, w?, h? }) for per-style sizing.
@prop particleCount {number} [50] - Number of particles to create.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial particle values at creation time.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per particle for custom animation logic.
@prop onCompleted {() => void} [undefined] - Callback fired when all particles have exited the screen.
-->

<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, ParticleStyleEntry } from '$lib/utils/types';

	import Confetti from '$lib/Confetti.svelte';

	interface Props {
		styles?: readonly ParticleStyleEntry[];
		particleCount?: number;
		onCreate?: OnCreateParticle;
		onUpdate?: OnUpdateParticle;
		onCompleted?: () => void;
	}

	const {
		styles = undefined,
		particleCount = 50,
		onCreate = undefined,
		onUpdate = undefined,
		onCompleted,
	}: Props = $props();
</script>

<Confetti {particleCount} {styles} {onCompleted} {onCreate} {onUpdate} />
