<!--
@component
Falling confetti effect. Particles spawn along the top edge of the viewport and drift downward with gravity and wind simulation.

&nbsp;

@prop styles {readonly ParticleStyleEntry[]} [undefined] - Render styles for confetti. Accepts plain styles (HTML colors, HTMLImageElement, CanvasImageSource) or config objects ({ style, w?, h? }) for per-style sizing.
@prop particleCount {number} [50] - Number of particles to create.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial particle values at creation time.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per particle for custom animation logic.
@callback on:completed {() => void} - Dispatched when all particles have exited the screen.
-->

<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, ParticleStyleEntry } from '$lib/utils/types';

	import Confetti from '$lib/Confetti.svelte';

	export let styles: readonly ParticleStyleEntry[] | undefined = undefined;
	export let particleCount = 50;
	export let onCreate: OnCreateParticle | undefined = undefined;
	export let onUpdate: OnUpdateParticle | undefined = undefined;
</script>

<Confetti {particleCount} {styles} on:completed {onCreate} {onUpdate} />
