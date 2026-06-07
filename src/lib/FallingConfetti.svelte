<!--
@component
Falling confetti effect. Particles spawn along the top edge of the viewport and drift downward with gravity and wind simulation.

&nbsp;

@prop styles {readonly ParticleStyle[]} [undefined] - Render styles for confetti. Valid HTML colors or HTMLImageElement.
@prop particleCount {number} [50] - Number of particles to create.
@prop onCreate {OnCreateParticle} [undefined] - Callback to override initial particle values at creation time.
@prop onUpdate {OnUpdateParticle} [undefined] - Callback called each frame per particle for custom animation logic.
@prop onCompleted {() => void} [undefined] - Callback fired when all particles have exited the screen.
-->

<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, ParticleStyle } from './utils/types';

	import Confetti from './Confetti.svelte';

	const {
		styles = undefined,
		particleCount = 50,
		onCreate = undefined,
		onUpdate = undefined,
		onCompleted,
	} = $props<{
		styles?: readonly ParticleStyle[];
		particleCount?: number;
		onCreate?: OnCreateParticle;
		onUpdate?: OnUpdateParticle;
		onCompleted?: () => void;
	}>();
</script>

<Confetti {particleCount} {styles} {onCompleted} {onCreate} {onUpdate} />
