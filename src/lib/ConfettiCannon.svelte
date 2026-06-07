<!--
@component
Confetti cannon effect. Fires particles from an origin point in a directed cone defined by angle, spread, and force.

&nbsp;

@prop origin {Position} - Origin position [x, y] of the confetti cannon. Required.
@prop styles {readonly ParticleStyle[]} [undefined] - Render styles for confetti. Valid HTML colors or HTMLImageElement.
@prop particleCount {number} [50] - Number of particles to create.
@prop force {number} [15] - Burst velocity. Higher = faster/further.
@prop angle {number} [-90] - Burst direction in degrees. Use with spread for directed bursts.
@prop spread {number} [360] - Angular spread in degrees. Use with angle for directed bursts.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial particle values at creation time.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per particle for custom animation logic.
@prop onCompleted {() => void} [undefined] - Callback fired when all particles have exited the screen.
-->

<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, ParticleStyle, Position } from './utils/types';

	import Confetti from './Confetti.svelte';

	const {
		origin,
		styles = undefined,
		particleCount = 50,
		force = 15,
		angle = -90,
		spread = 360,
		onCreate = undefined,
		onUpdate = undefined,
		onCompleted,
	} = $props<{
		origin: Position;
		styles?: readonly ParticleStyle[];
		particleCount?: number;
		force?: number;
		angle?: number;
		spread?: number;
		onCreate?: OnCreateParticle;
		onUpdate?: OnUpdateParticle;
		onCompleted?: () => void;
	}>();
</script>

<Confetti {angle} {force} {origin} {particleCount} {spread} {styles} {onCompleted} {onCreate} {onUpdate} />
