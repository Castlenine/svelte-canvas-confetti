<script lang="ts">
	import type { OnCreateParticle, OnUpdateParticle, Particle } from '$lib';
	import type { ParticleStyle, Position } from '$lib/utils/types';

	import { onMount } from 'svelte';

	import { ConfettiBurst, ConfettiCannon, FallingConfetti } from '$lib';
	import { coinFlip, random } from '$lib/utils/random';

	import ParachuteAssetImage from './assets/images/parachute.png';

	let particleCount = $state(Math.floor(random(100, 1)));
	let fallingConfettis: { id: number; particleCount: number }[] = $state([]);
	let parachutes: {
		id: number;
		styles: ParticleStyle[];
		particleCount: number;
		onCreate: OnCreateParticle;
		onUpdate: OnUpdateParticle;
	}[] = $state([]);
	let confettiBursts: { id: number; particleCount: number; origin: Position }[] = $state([]);
	let confettiCannons: {
		id: number;
		particleCount: number;
		spread: number;
		angle: number;
		force: number;
		origin: Position;
	}[] = $state([]);

	let parachuteImg: HTMLImageElement | null = $state(null);

	let counter = 0;

	function triggerFallingConfetti(): void {
		fallingConfettis = [
			...fallingConfettis,
			{
				id: counter++,
				particleCount,
			},
		];
	}

	function triggerParachutes(): void {
		if (!parachuteImg) return;

		parachutes = [
			...parachutes,
			{
				id: counter++,
				styles: [parachuteImg],
				particleCount,
				onCreate: (p: Particle) => ({
					...p,
					angle: 0,
					gy: 2,
					da: random(35, -35),
				}),
				onUpdate: (p: Particle) => {
					if ((p.angle > 35 && p.da > 0) || (p.angle < -35 && p.da < 0)) {
						p.da *= -1;
					}
				},
			},
		];
	}

	function triggerConfettiBurst(): void {
		confettiBursts = [
			...confettiBursts,
			{
				id: counter++,
				particleCount,
				origin: [
					random((window.innerWidth / 4) * 3, window.innerWidth / 4),
					random((window.innerHeight / 4) * 3, window.innerHeight / 4),
				],
			},
		];
	}

	function triggerConfettiCannon(): void {
		const LEFT = coinFlip();

		confettiCannons = [
			...confettiCannons,
			{
				id: counter++,
				particleCount,
				spread: random(90, 25),
				angle: random(65, 25) + (LEFT ? 270 : 180),
				force: random(55, 25),
				origin: [LEFT ? 0 : window.innerWidth, window.innerHeight],
			},
		];
	}

	function handleFallingConfettiCompleted(id: number): void {
		fallingConfettis = fallingConfettis.filter((c) => c.id !== id);
	}

	function handleParachuteCompleted(id: number): void {
		parachutes = parachutes.filter((c) => c.id !== id);
	}

	function handleConfettiBurstCompleted(id: number): void {
		confettiBursts = confettiBursts.filter((c) => c.id !== id);
	}

	function handleConfettiCannonCompleted(id: number): void {
		confettiCannons = confettiCannons.filter((c) => c.id !== id);
	}

	onMount(() => {
		const IMAGE = new Image();
		IMAGE.src = ParachuteAssetImage;

		IMAGE.decode()
			.then(() => {
				parachuteImg = IMAGE;
			})

			.catch(() => {
				console.warn('Warn::demo::onMount', 'Failed to load parachute image', { src: ParachuteAssetImage });
			});
	});
</script>

<svelte:head>
	<title>@castlenine/svelte-canvas-confetti</title>
	<meta name="description" content="Canvas-based confetti for Svelte 🎉, with no dependencies." />
</svelte:head>

<main class="vertical center">
	<div class="horizontal">
		<button type="button" onclick={triggerFallingConfetti}>Falling Confetti!</button>
		<button type="button" onclick={triggerConfettiBurst}>Confetti Burst!</button>
		<button type="button" onclick={triggerConfettiCannon}>Confetti Cannon!</button>
		<button type="button" disabled={!parachuteImg} onclick={triggerParachutes}>Parachutes!</button>
	</div>

	<div class="vertical">
		<div class="horizontal">
			<label for="particle-count">Particle Count</label>
			<input id="particle-count" type="range" min="5" max="200" step="1" bind:value={particleCount} />
			<span>{particleCount}</span>
		</div>
	</div>

	{#each fallingConfettis as { id, particleCount } (id)}
		<FallingConfetti {particleCount} onCompleted={() => handleFallingConfettiCompleted(id)} />
	{/each}

	{#each parachutes as { id, particleCount, styles, onCreate, onUpdate } (id)}
		<FallingConfetti {particleCount} {styles} onCompleted={() => handleParachuteCompleted(id)} {onCreate} {onUpdate} />
	{/each}

	{#each confettiBursts as { id, origin, particleCount } (id)}
		<ConfettiBurst {origin} {particleCount} onCompleted={() => handleConfettiBurstCompleted(id)} />
	{/each}

	{#each confettiCannons as { id, origin, angle, spread, force, particleCount } (id)}
		<ConfettiCannon
			{angle}
			{force}
			{origin}
			{particleCount}
			{spread}
			onCompleted={() => handleConfettiCannonCompleted(id)} />
	{/each}
</main>

<style>
	/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
	:global(body) {
		width: 100vw;
		height: 100vh;
		margin: 0;
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
	}

	main {
		position: relative;
		height: 100%;
	}

	.vertical {
		display: flex;
		flex-direction: column;
	}

	.horizontal {
		display: flex;
		margin-top: 2rem;
	}

	.center {
		justify-content: center;
		align-items: center;
	}

	button {
		padding: 0.75rem 2rem;
		border: none;
		border-radius: 4px;
		margin: 1rem;
		box-shadow: 5px 5px 0 0 rgb(0 0 0 / 80%);
		background: linear-gradient(-45deg, hsl(260deg 95% 75%), hsl(300deg 95% 75%));
		color: white;
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
		font-size: 1rem;
		font-weight: bold;
		text-shadow: -1px -1px rgb(0 0 0 / 60%);
		transition:
			transform 0.1s ease-in-out,
			box-shadow 0.1s ease-in-out;
		cursor: pointer;
	}

	button:hover {
		background: linear-gradient(-45deg, hsl(260deg 95% 65%), hsl(300deg 95% 65%));
	}

	button:active {
		box-shadow: 3px 3px 0 0 rgb(0 0 0 / 80%);
		transform: translate(2px, 2px);
	}

	input {
		accent-color: hsl(260deg 95% 65%);
	}

	[type='range'] {
		width: 50%;
		min-width: 300px;
	}

	label {
		flex: none;
		min-width: 150px;
		margin-right: 2rem;
	}

	span {
		flex: none;
		min-width: 40px;
		text-align: right;
	}
</style>
