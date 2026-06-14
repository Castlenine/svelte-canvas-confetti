<!--
@component
Dual number input for coordinate pairs such as [x, y] or [w, h]. Manages individual axis values
internally and reassigns the full tuple on change to ensure Svelte reactivity.

&nbsp;

@prop label {string} - Text label displayed to the left of the inputs.
@prop value {Position} bind: - Current coordinate pair as a [number, number] tuple.
@prop labelX {string} [X] - Sub-label for the first input.
@prop labelY {string} [Y] - Sub-label for the second input.
@prop maxX {number} [undefined] - Optional maximum for the first input.
@prop maxY {number} [undefined] - Optional maximum for the second input.
-->

<script lang="ts" context="module">
	let positionIdCounter = 0;
</script>

<script lang="ts">
	import type { Position } from '$lib/utils/types';

	export let label: string;
	export let value: Position;
	export let labelX = 'X';
	export let labelY = 'Y';
	export let maxX: number | undefined = undefined;
	export let maxY: number | undefined = undefined;

	// eslint-disable-next-line no-useless-assignment -- Module-scoped counter persists across component instances
	const ID = `position-${positionIdCounter++}`;
	const ID_X = `${ID}-x`;
	const ID_Y = `${ID}-y`;

	function handleChangeX(event: Event): void {
		const TARGET = event.target as HTMLInputElement;
		value = [TARGET.valueAsNumber, value[1]];
	}

	function handleChangeY(event: Event): void {
		const TARGET = event.target as HTMLInputElement;
		value = [value[0], TARGET.valueAsNumber];
	}
</script>

<div class="position-control">
	<span class="position-label">{label}</span>

	<div class="position-inputs">
		<div class="input-group">
			<label for={ID_X} class="sub-label">{labelX}</label>
			<input
				id={ID_X}
				class="number-input"
				value={value[0]}
				type="number"
				min={0}
				max={maxX}
				on:input={handleChangeX} />
		</div>

		<div class="input-group">
			<label for={ID_Y} class="sub-label">{labelY}</label>
			<input
				id={ID_Y}
				class="number-input"
				value={value[1]}
				type="number"
				min={0}
				max={maxY}
				on:input={handleChangeY} />
		</div>
	</div>
</div>

<style>
	.position-control {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.position-label {
		flex: 0 0 7rem;
		color: #cbd5e1;
		font-size: 0.875rem;
		user-select: none;
	}

	.position-inputs {
		display: flex;
		gap: 1rem;
	}

	.input-group {
		display: flex;
		gap: 0.375rem;
		align-items: center;
	}

	.sub-label {
		color: #94a3b8;
		font-size: 0.75rem;
		user-select: none;
	}

	.number-input {
		appearance: textfield;
		width: 80px;
		padding: 0.3rem 0.5rem;
		border: 1px solid #334155;
		border-radius: 4px;
		outline: none;
		background: #1e293b;
		color: #e2e8f0;
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}

	.number-input:focus-visible {
		border-color: #818cf8;
		box-shadow: 0 0 0 2px rgb(129 140 248 / 30%);
	}

	.number-input::-webkit-inner-spin-button,
	.number-input::-webkit-outer-spin-button {
		opacity: 1;
	}
</style>
