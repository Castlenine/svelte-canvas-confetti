<!--
@component
Demo page for @castlenine/svelte-canvas-confetti. Tab-based interface to try every component
and configure all props interactively.
-->

<script lang="ts">
	import type { Particle } from '$lib';
	import type { ParticleStyleEntry, Position } from '$lib/utils/types';

	import { onMount } from 'svelte';

	import { ConfettiBurst, ConfettiCannon, ConfettiFireworks, ConfettiSparkle, FallingConfetti } from '$lib';
	import { random } from '$lib/utils/random';

	import CodeExample from './demo/CodeExample.svelte';
	import DemoFooter from './demo/DemoFooter.svelte';
	import ParachuteAssetImage from './assets/images/parachute.png';
	import PositionControl from './demo/PositionControl.svelte';
	import RangeControl from './demo/RangeControl.svelte';
	import StylePicker from './demo/StylePicker.svelte';

	type TabKey = 'falling' | 'burst' | 'cannon' | 'sparkle' | 'fireworks' | 'parachutes' | 'emoji';

	interface TabDefinition {
		key: TabKey;
		label: string;
		fireLabel: string;
	}

	let activeTab = $state<TabKey>('falling');

	let particleCount = $state(50);
	let styles: ParticleStyleEntry[] = $state([]);
	let styleMetadata: {
		type: 'color' | 'emoji' | 'text' | 'image';
		label: string;
		fontSize?: number;
		textColor?: string;
		w?: number | null;
		h?: number | null;
	}[] = $state([]);
	let emojiStyles: ParticleStyleEntry[] = $state([]);
	let emojiStyleMetadata: {
		type: 'color' | 'emoji' | 'text' | 'image';
		label: string;
		fontSize?: number;
		textColor?: string;
		w?: number | null;
		h?: number | null;
	}[] = $state([]);
	let parachuteImg: HTMLImageElement | null = $state(null);

	let burstOrigin: Position = $state([0, 0]);

	let cannonOrigin: Position = $state([0, 0]);
	let cannonForce = $state(15);
	let cannonAngle = $state(295);
	let cannonSpread = $state(60);

	let sparkleDuration = $state(3);
	let sparkleSpeed = $state(2);
	let sparkleArea: Position = $state([0, 0]);
	let sparkleAreaOrigin: Position = $state([0, 0]);

	let fireworkCount = $state(3);
	let fireworkBurstForce = $state(12);
	let fireworkLaunchForce = $state(25);
	let fireworkStaggerDelay = $state(400);
	let fireworkRocketColor = $state('#f5f5f5');

	let emojiOrigin: Position = $state([0, 0]);

	let particleGravity: number | null = $state(null);
	let particleOpacity: number | null = $state(null);
	let particleSway: number | null = $state(null);
	let particleRotation: number | null = $state(null);
	let particleDelay: number | null = $state(null);

	interface ConfettiInstance {
		id: number;
		particleCount: number;
		styles: readonly ParticleStyleEntry[];
		onCreate?: (p: Particle) => Particle;
	}

	type CannonInstance = ConfettiInstance & { origin: Position; force: number; angle: number; spread: number };

	let fallingInstances: ConfettiInstance[] = $state([]);
	let burstInstances: (ConfettiInstance & { origin: Position })[] = $state([]);
	let cannonInstances: CannonInstance[] = $state([]);
	let sparkleInstances: (ConfettiInstance & {
		duration: number;
		sparkleSpeed: number;
		area: Position;
		areaOrigin: Position;
	})[] = $state([]);
	let fireworkInstances: (ConfettiInstance & {
		count: number;
		burstForce: number;
		launchForce: number;
		staggerDelay: number;
		rocketStyles: readonly ParticleStyleEntry[];
	})[] = $state([]);
	let parachuteInstances: { id: number; particleCount: number }[] = $state([]);
	let emojiBurstInstances: (ConfettiInstance & { origin: Position })[] = $state([]);

	const IS_MAIN_EFFECT = $derived(activeTab !== 'parachutes' && activeTab !== 'emoji');

	const IS_FIRE_DISABLED = $derived.by(() => {
		if (activeTab === 'parachutes') return parachuteImg == null;
		if (activeTab === 'emoji') return emojiStyles.length === 0;

		return styles.length === 0;
	});

	const FIRE_LABEL = $derived(findFireLabel(activeTab));

	const TABS: readonly TabDefinition[] = [
		{ key: 'falling', label: 'Falling', fireLabel: 'Drop Confetti!' },
		{ key: 'burst', label: 'Burst', fireLabel: 'Burst!' },
		{ key: 'cannon', label: 'Cannon', fireLabel: 'Fire Cannon!' },
		{ key: 'sparkle', label: 'Sparkle', fireLabel: 'Sparkle!' },
		{ key: 'fireworks', label: 'Fireworks', fireLabel: 'Launch!' },
		{ key: 'parachutes', label: 'Parachutes', fireLabel: 'Drop!' },
		{ key: 'emoji', label: 'Emoji', fireLabel: 'Emoji Burst!' },
	] as const;

	let counter = 0;

	function findFireLabel(tab: TabKey): string {
		return TABS.find((t) => t.key === tab)?.fireLabel ?? 'Fire!';
	}

	function createParachuteOnCreate(p: Particle): Particle {
		return {
			...p,
			angle: 0,
			gy: 2,
			da: random(35, -35),
		};
	}

	function parachuteOnUpdate(p: Particle): void {
		if ((p.angle > 35 && p.da > 0) || (p.angle < -35 && p.da < 0)) {
			p.da *= -1;
		}
	}

	function clampParticleValue(rawValue: string, min: number, max: number): number | null {
		if (rawValue === '' || rawValue.toLowerCase() === 'default') return null;

		const PARSED = Number(rawValue);

		if (Number.isNaN(PARSED)) return null;

		return Math.min(max, Math.max(min, PARSED));
	}

	function buildParticleOnCreate(): ((p: Particle) => Particle) | undefined {
		const GY = particleGravity;
		const OP = particleOpacity;
		const XW = particleSway;
		const DA = particleRotation;
		const DL = particleDelay;

		const HAS_ANY_OVERRIDE = GY != null || OP != null || XW != null || DA != null || DL != null;

		if (!HAS_ANY_OVERRIDE) {
			return undefined;
		}

		return (p: Particle): Particle => ({
			...p,
			...(GY != null && { gy: GY }),
			...(OP != null && { opacity: OP }),
			...(XW != null && { xw: XW }),
			...(DA != null && { da: DA }),
			...(DL != null && { delay: DL }),
		});
	}

	function triggerFalling(): void {
		fallingInstances = [
			...fallingInstances,
			{ id: counter++, particleCount, styles: [...styles], onCreate: buildParticleOnCreate() },
		];
	}

	function triggerBurst(): void {
		burstInstances = [
			...burstInstances,
			{
				id: counter++,
				particleCount,
				origin: [burstOrigin[0], burstOrigin[1]] as Position,
				styles: [...styles],
				onCreate: buildParticleOnCreate(),
			},
		];
	}

	function triggerCannon(): void {
		cannonInstances = [
			...cannonInstances,
			{
				id: counter++,
				particleCount,
				origin: [cannonOrigin[0], cannonOrigin[1]] as Position,
				force: cannonForce,
				angle: cannonAngle,
				spread: cannonSpread,
				styles: [...styles],
				onCreate: buildParticleOnCreate(),
			},
		];
	}

	function triggerSparkle(): void {
		sparkleInstances = [
			...sparkleInstances,
			{
				id: counter++,
				particleCount,
				duration: sparkleDuration,
				sparkleSpeed,
				area: [sparkleArea[0], sparkleArea[1]] as Position,
				areaOrigin: [sparkleAreaOrigin[0], sparkleAreaOrigin[1]] as Position,
				styles: [...styles],
				onCreate: buildParticleOnCreate(),
			},
		];
	}

	function triggerFireworks(): void {
		fireworkInstances = [
			...fireworkInstances,
			{
				id: counter++,
				count: fireworkCount,
				particleCount,
				burstForce: fireworkBurstForce,
				launchForce: fireworkLaunchForce,
				staggerDelay: fireworkStaggerDelay,
				styles: [...styles],
				rocketStyles: [fireworkRocketColor],
				onCreate: buildParticleOnCreate(),
			},
		];
	}

	function triggerParachutes(): void {
		if (parachuteImg == null) return;
		parachuteInstances = [...parachuteInstances, { id: counter++, particleCount }];
	}

	function triggerEmoji(): void {
		if (emojiStyles.length === 0) return;
		emojiBurstInstances = [
			...emojiBurstInstances,
			{
				id: counter++,
				particleCount,
				origin: [emojiOrigin[0], emojiOrigin[1]] as Position,
				styles: [...emojiStyles],
				onCreate: buildParticleOnCreate(),
			},
		];
	}

	function handleFallingCompleted(id: number): void {
		fallingInstances = fallingInstances.filter((i) => i.id !== id);
	}

	function handleBurstCompleted(id: number): void {
		burstInstances = burstInstances.filter((i) => i.id !== id);
	}

	function handleCannonCompleted(id: number): void {
		cannonInstances = cannonInstances.filter((i) => i.id !== id);
	}

	function handleSparkleCompleted(id: number): void {
		sparkleInstances = sparkleInstances.filter((i) => i.id !== id);
	}

	function handleFireworkCompleted(id: number): void {
		fireworkInstances = fireworkInstances.filter((i) => i.id !== id);
	}

	function handleParachuteCompleted(id: number): void {
		parachuteInstances = parachuteInstances.filter((i) => i.id !== id);
	}

	function handleEmojiBurstCompleted(id: number): void {
		emojiBurstInstances = emojiBurstInstances.filter((i) => i.id !== id);
	}

	function handleParticleGravityChange(event: Event): void {
		particleGravity = clampParticleValue((event.target as HTMLInputElement).value, 0, 10);
	}

	function handleParticleOpacityChange(event: Event): void {
		particleOpacity = clampParticleValue((event.target as HTMLInputElement).value, 0, 1);
	}

	function handleParticleSwayChange(event: Event): void {
		particleSway = clampParticleValue((event.target as HTMLInputElement).value, 0, 10);
	}

	function handleParticleRotationChange(event: Event): void {
		particleRotation = clampParticleValue((event.target as HTMLInputElement).value, 0, 360);
	}

	function handleParticleDelayChange(event: Event): void {
		particleDelay = clampParticleValue((event.target as HTMLInputElement).value, 0, 3);
	}

	function handleFire(): void {
		switch (activeTab) {
			case 'falling':
				triggerFalling();
				break;

			case 'burst':
				triggerBurst();
				break;

			case 'cannon':
				triggerCannon();
				break;

			case 'sparkle':
				triggerSparkle();
				break;

			case 'fireworks':
				triggerFireworks();
				break;

			case 'parachutes':
				triggerParachutes();
				break;

			case 'emoji':
				triggerEmoji();
				break;

			default:
				throw new Error(`Unhandled tab: "${activeTab as string}"`);
		}
	}

	function handleTabChange(key: TabKey): void {
		activeTab = key;
	}

	onMount(() => {
		const CENTER_X = Math.round(window.innerWidth / 2);
		const CENTER_Y = Math.round(window.innerHeight / 2);

		burstOrigin = [CENTER_X, CENTER_Y];
		cannonOrigin = [0, window.innerHeight];
		emojiOrigin = [CENTER_X, CENTER_Y];
		sparkleArea = [window.innerWidth, window.innerHeight];

		const IMAGE = new Image();
		IMAGE.src = ParachuteAssetImage;

		void IMAGE.decode()
			.then(() => {
				parachuteImg = IMAGE;
			})

			.catch(() => {
				console.warn('Warn::demo::onMount', 'Failed to load parachute image');
			});
	});
</script>

<svelte:head>
	<title>@castlenine/svelte-canvas-confetti</title>
	<meta name="description" content="Canvas-based confetti for Svelte, with no dependencies." />
</svelte:head>

<div class="page">
	<header class="header">
		<h1 class="title">@castlenine/svelte-canvas-confetti</h1>
		<p class="tagline">Canvas-based confetti for Svelte, with no dependencies</p>
	</header>

	<nav class="tabs">
		{#each TABS as tab (tab.key)}
			<button
				class="tab"
				class:is-active={activeTab === tab.key}
				type="button"
				onclick={() => handleTabChange(tab.key)}>
				{tab.label}
			</button>
		{/each}
	</nav>

	<section class="controls">
		{#if activeTab === 'emoji'}
			<p class="info-text margin-bottom-2">
				Similar to the Burst effect, but with emoji and text styles created via <code>createTextStyle</code>.
			</p>
		{/if}

		{#if activeTab === 'parachutes'}
			<p class="info-text">Similar to the Falling effect, but with a predefined parachute image.</p>

			<p class="info-text margin-bottom-2">
				{#if parachuteImg}
					Using parachute image with custom <code>onCreate</code> / <code>onUpdate</code> callbacks for swinging physics.
				{:else}
					Loading parachute image...
				{/if}
			</p>
		{/if}

		<RangeControl min={1} max={200} bind:value={particleCount} label="Particles" />

		<div class:is-hidden={!IS_MAIN_EFFECT}>
			<StylePicker bind:styleMetadata bind:styles />
		</div>

		<div class:is-hidden={activeTab !== 'emoji'}>
			<StylePicker
				bind:styleMetadata={emojiStyleMetadata}
				bind:styles={emojiStyles}
				label="Emoji Styles"
				mode="emoji" />
		</div>

		{#if activeTab === 'burst'}
			<PositionControl bind:value={burstOrigin} label="Origin" />
		{/if}

		{#if activeTab === 'emoji'}
			<PositionControl bind:value={emojiOrigin} label="Origin" />
		{/if}

		{#if activeTab === 'cannon'}
			<PositionControl bind:value={cannonOrigin} label="Origin" />
			<RangeControl min={5} max={55} bind:value={cannonForce} label="Force" />
			<RangeControl min={0} max={360} bind:value={cannonAngle} label="Angle" unit="°" />
			<RangeControl min={0} max={360} bind:value={cannonSpread} label="Spread" unit="°" />
		{/if}

		{#if activeTab === 'sparkle'}
			<RangeControl min={1} max={10} bind:value={sparkleDuration} label="Duration" unit="s" />
			<RangeControl min={0.1} max={10} step={0.1} bind:value={sparkleSpeed} label="Speed" />
			<PositionControl bind:value={sparkleArea} label="Area" labelX="W" labelY="H" />
			<PositionControl bind:value={sparkleAreaOrigin} label="Area Origin" />
		{/if}

		{#if activeTab === 'fireworks'}
			<RangeControl min={1} max={10} bind:value={fireworkCount} label="Count" />
			<RangeControl min={5} max={30} bind:value={fireworkBurstForce} label="Burst Force" />
			<RangeControl min={10} max={50} bind:value={fireworkLaunchForce} label="Launch Force" />
			<RangeControl min={100} max={1000} step={50} bind:value={fireworkStaggerDelay} label="Stagger Delay" unit="ms" />
			<div class="rocket-color-row">
				<label for="rocket-color" class="rocket-color-label">Rocket Color</label>
				<input id="rocket-color" class="rocket-color-input" type="color" bind:value={fireworkRocketColor} />
			</div>
		{/if}

		{#if activeTab !== 'parachutes'}
			<div class="particle-props">
				<span class="particle-props-label">Particle Properties</span>
				<div class="particle-props-grid">
					<label class="particle-prop-item">
						<span class="particle-prop-name">Gravity</span>
						<input
							class="particle-prop-input"
							value={particleGravity ?? 'default'}
							type="text"
							placeholder="default"
							onchange={handleParticleGravityChange} />
					</label>
					{#if activeTab !== 'sparkle'}
						<label class="particle-prop-item">
							<span class="particle-prop-name">Opacity</span>
							<input
								class="particle-prop-input"
								value={particleOpacity ?? 'default'}
								type="text"
								placeholder="default"
								onchange={handleParticleOpacityChange} />
						</label>
					{/if}
					<label class="particle-prop-item">
						<span class="particle-prop-name">Sway</span>
						<input
							class="particle-prop-input"
							value={particleSway ?? 'default'}
							type="text"
							placeholder="default"
							onchange={handleParticleSwayChange} />
					</label>
					<label class="particle-prop-item">
						<span class="particle-prop-name">Rotation</span>
						<input
							class="particle-prop-input"
							value={particleRotation ?? 'default'}
							type="text"
							placeholder="default"
							onchange={handleParticleRotationChange} />
					</label>
					<label class="particle-prop-item">
						<span class="particle-prop-name">Delay</span>
						<input
							class="particle-prop-input"
							value={particleDelay ?? 'default'}
							type="text"
							placeholder="default"
							onchange={handleParticleDelayChange} />
					</label>
				</div>
			</div>
		{/if}

		<button class="fire-button" type="button" disabled={IS_FIRE_DISABLED} onclick={handleFire}>
			{FIRE_LABEL}
		</button>
	</section>

	<CodeExample
		{activeTab}
		{burstOrigin}
		{cannonAngle}
		{cannonForce}
		{cannonOrigin}
		{cannonSpread}
		{emojiOrigin}
		{emojiStyleMetadata}
		{fireworkBurstForce}
		{fireworkCount}
		{fireworkLaunchForce}
		{fireworkRocketColor}
		{fireworkStaggerDelay}
		{particleCount}
		{particleDelay}
		{particleGravity}
		{particleOpacity}
		{particleRotation}
		{particleSway}
		{sparkleArea}
		{sparkleAreaOrigin}
		{sparkleDuration}
		{sparkleSpeed}
		{styleMetadata} />

	{#each fallingInstances as instance (instance.id)}
		<FallingConfetti
			particleCount={instance.particleCount}
			styles={instance.styles}
			onCompleted={() => handleFallingCompleted(instance.id)}
			onCreate={instance.onCreate} />
	{/each}

	{#each burstInstances as instance (instance.id)}
		<ConfettiBurst
			origin={instance.origin}
			particleCount={instance.particleCount}
			styles={instance.styles}
			onCompleted={() => handleBurstCompleted(instance.id)}
			onCreate={instance.onCreate} />
	{/each}

	{#each cannonInstances as instance (instance.id)}
		<ConfettiCannon
			angle={instance.angle}
			force={instance.force}
			origin={instance.origin}
			particleCount={instance.particleCount}
			spread={instance.spread}
			styles={instance.styles}
			onCompleted={() => handleCannonCompleted(instance.id)}
			onCreate={instance.onCreate} />
	{/each}

	{#each sparkleInstances as instance (instance.id)}
		<ConfettiSparkle
			area={instance.area}
			areaOrigin={instance.areaOrigin}
			duration={instance.duration}
			particleCount={instance.particleCount}
			sparkleSpeed={instance.sparkleSpeed}
			styles={instance.styles}
			onCompleted={() => handleSparkleCompleted(instance.id)}
			onCreate={instance.onCreate} />
	{/each}

	{#each fireworkInstances as instance (instance.id)}
		<ConfettiFireworks
			burstForce={instance.burstForce}
			count={instance.count}
			launchForce={instance.launchForce}
			particleCount={instance.particleCount}
			rocketStyles={instance.rocketStyles}
			staggerDelay={instance.staggerDelay}
			styles={instance.styles}
			onCompleted={() => handleFireworkCompleted(instance.id)}
			onCreate={instance.onCreate} />
	{/each}

	{#if parachuteImg}
		{#each parachuteInstances as { id, particleCount } (id)}
			<FallingConfetti
				{particleCount}
				styles={[parachuteImg]}
				onCompleted={() => handleParachuteCompleted(id)}
				onCreate={createParachuteOnCreate}
				onUpdate={parachuteOnUpdate} />
		{/each}
	{/if}

	{#each emojiBurstInstances as instance (instance.id)}
		<ConfettiBurst
			origin={instance.origin}
			particleCount={instance.particleCount}
			styles={instance.styles}
			onCompleted={() => handleEmojiBurstCompleted(instance.id)}
			onCreate={instance.onCreate} />
	{/each}

	<DemoFooter />
</div>

<style>
	/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
	:global(body) {
		width: 100%;
		min-height: 100vh;
		margin: 0;
		background: #0f172a;
		color: #e2e8f0;
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
	}

	.page {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100vh;
		padding: 2rem 1rem;
	}

	.header {
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.title {
		margin: 0;
		background: linear-gradient(135deg, hsl(260deg 95% 75%), hsl(300deg 95% 75%));
		background-clip: text;
		color: transparent;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.tagline {
		margin: 0.25rem 0 0;
		color: #94a3b8;
		font-size: 0.85rem;
	}

	.tabs {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
		justify-content: center;
		max-width: 640px;
		margin-bottom: 1.5rem;
	}

	.tab {
		padding: 0.4rem 0.85rem;
		border: 1px solid #334155;
		border-radius: 999px;
		background: transparent;
		color: #94a3b8;
		font-family: inherit;
		font-size: 0.8rem;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background-color 0.15s ease;
		cursor: pointer;
	}

	.tab:hover {
		border-color: #475569;
		color: #cbd5e1;
	}

	.tab.is-active {
		border-color: hsl(280deg 95% 65%);
		background: hsl(280deg 95% 65% / 12%);
		color: #e2e8f0;
	}

	.controls {
		display: flex;
		gap: 0.75rem;
		flex-direction: column;
		width: 100%;
		max-width: 1000px;
		padding: 1.25rem;
		border: 1px solid #1e293b;
		border-radius: 12px;
		background: #0f172a;
	}

	.is-hidden {
		display: none;
	}

	.info-text {
		margin: 0;
		color: #94a3b8;
		font-size: 0.8rem;
	}

	.info-text.margin-bottom-2 {
		margin-bottom: 2rem;
	}

	.info-text code {
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		background: #1e293b;
		color: #818cf8;
		font-size: 0.75rem;
	}

	.particle-props {
		display: flex;
		gap: 0.375rem;
		flex-direction: column;
	}

	.particle-props-label {
		color: #64748b;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		user-select: none;
	}

	.particle-props-grid {
		display: grid;
		gap: 0.375rem 0.75rem;
		grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
	}

	.particle-prop-item {
		display: flex;
		gap: 0.375rem;
		align-items: center;
	}

	.particle-prop-name {
		flex: 0 0 auto;
		min-width: 3.5rem;
		color: #94a3b8;
		font-size: 0.7rem;
		user-select: none;
	}

	.particle-prop-input {
		flex: 1 1 auto;
		min-width: 0;
		padding: 0.2rem 0.35rem;
		border: 1px solid #334155;
		border-radius: 4px;
		background: #1e293b;
		color: #e2e8f0;
		font-family: monospace;
		font-size: 0.7rem;
		text-align: right;
	}

	.particle-prop-input:focus-visible {
		border-color: #818cf8;
		outline: none;
		box-shadow: 0 0 0 2px rgb(129 140 248 / 30%);
	}

	.rocket-color-row {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.rocket-color-label {
		flex: 0 0 7rem;
		color: #cbd5e1;
		font-size: 0.875rem;
		user-select: none;
	}

	.rocket-color-input {
		width: 32px;
		height: 32px;
		padding: 0;
		border: 1px solid #334155;
		border-radius: 4px;
		background: none;
		cursor: pointer;
	}

	.rocket-color-input::-webkit-color-swatch-wrapper {
		padding: 2px;
	}

	.rocket-color-input::-webkit-color-swatch {
		border: none;
		border-radius: 2px;
	}

	.rocket-color-input::-moz-color-swatch {
		border: none;
		border-radius: 2px;
	}

	.fire-button {
		width: 100%;
		padding: 0.7rem 1.5rem;
		border: none;
		border-radius: 8px;
		margin-top: 0.5rem;
		box-shadow: 0 4px 12px hsl(280deg 95% 50% / 25%);
		background: linear-gradient(-45deg, hsl(260deg 95% 65%), hsl(300deg 95% 65%));
		color: white;
		font-family: inherit;
		font-size: 1rem;
		font-weight: 700;
		text-shadow: 0 1px 2px rgb(0 0 0 / 30%);
		transition:
			opacity 0.15s ease,
			transform 0.1s ease,
			box-shadow 0.15s ease;
		cursor: pointer;
	}

	.fire-button:hover:not(:disabled) {
		box-shadow: 0 6px 16px hsl(280deg 95% 50% / 35%);
		transform: translateY(-1px);
	}

	.fire-button:active:not(:disabled) {
		box-shadow: 0 2px 8px hsl(280deg 95% 50% / 20%);
		transform: translateY(1px);
	}

	.fire-button:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
</style>
