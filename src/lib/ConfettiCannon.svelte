<!--
@component
Confetti cannon effect. Fires particles from an origin point in a directed cone defined by angle, spread, and force.

&nbsp;

@prop origin {Position} - Origin position [x, y] of the confetti cannon. Required.
@prop styles {readonly ParticleStyleEntry[]} [undefined] - Render styles for confetti. Accepts plain styles (HTML colors, HTMLImageElement, CanvasImageSource) or config objects ({ style, w?, h? }) for per-style sizing.
@prop particleCount {number} [50] - Number of particles to create.
@prop force {number} [15] - Burst velocity. Higher = faster/further.
@prop angle {number} [-90] - Burst direction in degrees. Use with spread for directed bursts.
@prop spread {number} [360] - Angular spread in degrees. Use with angle for directed bursts.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial particle values at creation time.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per particle for custom animation logic.
@callback on:completed {() => void} - Dispatched when all particles have exited the screen.
-->

<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, ParticleStyleEntry, Position } from '$lib/utils/types';

	import Confetti from '$lib/Confetti.svelte';

	export let origin: Position;
	export let styles: readonly ParticleStyleEntry[] | undefined = undefined;
	export let particleCount = 50;
	export let force = 15;
	export let angle = -90;
	export let spread = 360;
	export let onCreate: OnCreateParticle | undefined = undefined;
	export let onUpdate: OnUpdateParticle | undefined = undefined;
</script>

<Confetti {angle} {force} {origin} {particleCount} {spread} {styles} on:completed {onCreate} {onUpdate} />
