<!--
@component
Confetti burst effect. Spawns particles from a single origin point that explode outward in all directions (360° spread).

&nbsp;

@prop origin {Position} - Origin position [x, y] of the confetti burst. Required.
@prop styles {readonly ParticleStyle[]} [undefined] - Render styles for confetti. Valid HTML colors or HTMLImageElement.
@prop particleCount {number} [50] - Number of particles to create.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial particle values at creation time.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per particle for custom animation logic.
@callback on:completed {() => void} - Dispatched when all particles have exited the screen.
-->

<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, ParticleStyle, Position } from './utils/types';

	import Confetti from './Confetti.svelte';

	export let origin: Position;
	export let styles: readonly ParticleStyle[] | undefined = undefined;
	export let particleCount = 50;
	export let onCreate: OnCreateParticle | undefined = undefined;
	export let onUpdate: OnUpdateParticle | undefined = undefined;
</script>

<Confetti {origin} {particleCount} {styles} on:completed {onCreate} {onUpdate} />
