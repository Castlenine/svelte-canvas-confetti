<!--
@component
Reusable labeled range slider for demo controls. Renders a horizontal row with a fixed-width label, a flexible range input, and a fixed-width value display with an optional unit suffix.

&nbsp;

@prop label {string} - Text label displayed to the left of the slider.
@prop value {number} $bindable - Current slider value, bindable for two-way data flow.
@prop min {number} - Minimum allowed value.
@prop max {number} - Maximum allowed value.
@prop step {number} [1] - Step increment between values.
@prop unit {string} [undefined] - Optional display suffix appended to the value (e.g. "ms", "s").
-->

<script lang="ts">
	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		step?: number;
		unit?: string;
	}

	const ID = $props.id();

	let { label, value = $bindable(), min, max, step = 1, unit = undefined }: Props = $props();

	const DISPLAY = $derived(unit == null ? `${value}` : `${value}${unit}`);
</script>

<div class="range-control">
	<label for={ID} class="range-label">{label}</label>
	<input id={ID} class="range-input" type="range" {min} {max} {step} bind:value />
	<span class="range-value">{DISPLAY}</span>
</div>

<style>
	.range-control {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.range-label {
		flex: 0 0 7rem;
		color: #cbd5e1;
		font-size: 0.875rem;
		user-select: none;
	}

	.range-input {
		appearance: none;
		flex: 1 1 auto;
		min-width: 0;
		height: 4px;
		border-radius: 2px;
		outline: none;
		background: #334155;
		cursor: pointer;
	}

	.range-input::-webkit-slider-thumb {
		appearance: none;
		width: 14px;
		height: 14px;
		border: none;
		border-radius: 50%;
		background: #818cf8;
	}

	.range-input::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border: none;
		border-radius: 50%;
		background: #818cf8;
	}

	.range-input:focus-visible::-webkit-slider-thumb {
		box-shadow: 0 0 0 3px rgb(129 140 248 / 40%);
	}

	.range-input:focus-visible::-moz-range-thumb {
		box-shadow: 0 0 0 3px rgb(129 140 248 / 40%);
	}

	.range-value {
		flex: 0 0 4rem;
		color: #e2e8f0;
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
</style>
