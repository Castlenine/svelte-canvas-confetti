<!--
@component
Style picker for selecting confetti particle styles. Supports color presets, custom colors,
emoji presets with independent size control, and custom text input with independent size and color controls.
Also supports image uploads with per-image width/height controls. All style types (colors,
emoji, text, images) can be mixed freely. Outputs an array of ParticleStyle values for use
with confetti components.

&nbsp;

@prop styles {ParticleStyle[]} $bindable - Active particle styles array synced to parent.
@prop styleMetadata {readonly StyleEntryMeta[]} $bindable - Per-entry metadata for code generation (type, label, fontSize, textColor, image dimensions).
@prop mode {'all' | 'colors' | 'emoji'} ['all'] - Controls which picker sections are visible.
@prop label {string} ['Styles'] - Display label for the picker.
-->

<script lang="ts">
	import type { ParticleStyle } from '$lib/utils/types';

	import { onMount } from 'svelte';

	import { createTextStyle } from '$lib/utils/create-text-style';

	interface StyleEntryMeta {
		type: 'color' | 'emoji' | 'image';
		label: string;
		fontSize?: number;
		fontFamily?: string;
		textColor?: string;
		imageWidth?: number | null;
		imageHeight?: number | null;
	}

	interface StyleEntry extends StyleEntryMeta {
		style: ParticleStyle;
		originalImage?: HTMLImageElement;
	}

	interface Props {
		styles: ParticleStyle[];
		styleMetadata?: StyleEntryMeta[];
		mode?: 'all' | 'colors' | 'emoji';
		label?: string;
	}

	// eslint-disable-next-line no-useless-assignment -- $bindable() values are accessed by parents via Svelte's bind: directive (see eslint-plugin-svelte#1478)
	let { styles = $bindable(), styleMetadata = $bindable(), mode = 'all', label = 'Styles' }: Props = $props();

	let entries = $state<StyleEntry[]>([]);
	let customColor = $state('#818cf8');
	let customEmoji = $state('');
	let customTextColor = $state('#000000');
	let customFontFamily = $state('sans-serif');
	let emojiSize = $state(28);
	let textSize = $state(28);

	const IS_SHOW_COLORS = $derived(mode === 'all' || mode === 'colors');
	const IS_SHOW_EMOJI = $derived(mode === 'all' || mode === 'emoji');
	const IS_SHOW_IMAGES = $derived(mode === 'all');

	const FONT_FAMILIES: readonly string[] = [
		'sans-serif',
		'serif',
		'monospace',
		'cursive',
		'fantasy',
		'system-ui',
		'Arial',
		'Helvetica',
		'Times New Roman',
		'Georgia',
		'Courier New',
		'Verdana',
		'Trebuchet MS',
		'Impact',
		'Comic Sans MS',
	] as const;

	const DEFAULT_COLORS: readonly string[] = [
		'hotpink',
		'gold',
		'dodgerblue',
		'tomato',
		'rebeccapurple',
		'lightgreen',
		'turquoise',
	] as const;

	const PRESET_EMOJIS: readonly string[] = [
		'\u{1F389}',
		'\u{2B50}',
		'\u{2764}\u{FE0F}',
		'\u{1F38A}',
		'\u{1F388}',
		'\u{1F31F}',
	] as const;

	const DEFAULT_FONT_SIZE = 28;

	function isColorActive(color: string): boolean {
		return entries.some((entry) => entry.type === 'color' && entry.label === color);
	}

	function handleToggleColor(color: string): void {
		const INDEX = entries.findIndex((entry) => entry.type === 'color' && entry.label === color);

		if (INDEX === -1) {
			entries = [...entries, { style: color, label: color, type: 'color' }];
		} else {
			entries = entries.filter((_, index) => index !== INDEX);
		}
	}

	function handleAddCustomColor(): void {
		const IS_DUPLICATE = entries.some((entry) => entry.type === 'color' && entry.label === customColor);

		if (IS_DUPLICATE) {
			return;
		}

		entries = [...entries, { style: customColor, label: customColor, type: 'color' }];
	}

	function handleAddEmoji(emoji: string): void {
		const CANVAS = createTextStyle(emoji, { fontSize: emojiSize });
		entries = [...entries, { style: CANVAS, label: emoji, type: 'emoji', fontSize: emojiSize }];
	}

	function handleAddCustomEmoji(): void {
		const TRIMMED = customEmoji.trim();

		if (TRIMMED.length === 0) {
			return;
		}

		const FONT_OPTIONS = { fontSize: textSize, fontFamily: customFontFamily, color: customTextColor } as const;
		const CANVAS = createTextStyle(TRIMMED, FONT_OPTIONS);
		entries = [
			...entries,
			{
				style: CANVAS,
				label: TRIMMED,
				type: 'emoji',
				fontSize: textSize,
				fontFamily: customFontFamily,
				textColor: customTextColor,
			},
		];
		customEmoji = '';
	}

	function createSizedImageCanvas(image: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
		const CANVAS = document.createElement('canvas');
		CANVAS.width = width;
		CANVAS.height = height;
		const CONTEXT = CANVAS.getContext('2d');

		if (CONTEXT) CONTEXT.drawImage(image, 0, 0, width, height);

		return CANVAS;
	}

	function handleFileUpload(event: Event): void {
		const TARGET = event.target as HTMLInputElement;
		const FILE = TARGET.files?.[0];

		if (FILE == null) {
			return;
		}

		const IMAGE = new Image();
		const OBJECT_URL = URL.createObjectURL(FILE);
		IMAGE.src = OBJECT_URL;

		void IMAGE.decode().then(() => {
			entries = [
				...entries,
				{
					style: IMAGE,
					label: FILE.name,
					type: 'image',
					originalImage: IMAGE,
					imageWidth: null,
					imageHeight: null,
				},
			];
		});

		TARGET.value = '';
	}

	function resolveImageDimensions(
		image: HTMLImageElement,
		width: number | null,
		height: number | null,
	): [number, number] {
		const ASPECT = image.width / image.height;

		if (width != null && height != null) return [width, height];
		if (width != null) return [width, Math.round(width / ASPECT)];
		if (height != null) return [Math.round(height * ASPECT), height];

		return [image.width, image.height];
	}

	function handleImageResize(index: number, width: number | null, height: number | null): void {
		const ENTRY = entries[index];

		if (ENTRY.type !== 'image' || !(ENTRY.originalImage instanceof HTMLImageElement)) return;

		const [RESOLVED_W, RESOLVED_H] = resolveImageDimensions(ENTRY.originalImage, width, height);
		const IS_ORIGINAL = RESOLVED_W === ENTRY.originalImage.width && RESOLVED_H === ENTRY.originalImage.height;
		const STYLE = IS_ORIGINAL
			? ENTRY.originalImage
			: createSizedImageCanvas(ENTRY.originalImage, RESOLVED_W, RESOLVED_H);

		entries = entries.map((entry, entryIndex) =>
			entryIndex === index ? { ...entry, style: STYLE, imageWidth: width, imageHeight: height } : entry,
		);
	}

	function parseImageDimension(rawValue: string): number | null {
		if (rawValue === '' || rawValue.toLowerCase() === 'auto') return null;

		const PARSED = Number(rawValue);

		if (Number.isNaN(PARSED) || PARSED < 1) return null;

		return Math.min(512, Math.round(PARSED));
	}

	function handleImageWidthChange(index: number, rawValue: string): void {
		const WIDTH = parseImageDimension(rawValue);
		handleImageResize(index, WIDTH, entries[index].imageHeight ?? null);
	}

	function handleImageHeightChange(index: number, rawValue: string): void {
		const HEIGHT = parseImageDimension(rawValue);
		handleImageResize(index, entries[index].imageWidth ?? null, HEIGHT);
	}

	function handleRemoveEntry(index: number): void {
		const ENTRY = entries[index];

		if (ENTRY.type === 'image' && ENTRY.originalImage instanceof HTMLImageElement) {
			URL.revokeObjectURL(ENTRY.originalImage.src);
		}

		entries = entries.filter((_, entryIndex) => entryIndex !== index);
	}

	function initializeDefaults(): void {
		if (mode === 'all' || mode === 'colors') {
			entries = DEFAULT_COLORS.map((color) => ({
				style: color,
				label: color,
				type: 'color' as const,
			}));
		} else {
			entries = PRESET_EMOJIS.slice(0, 4).map((emoji) => ({
				style: createTextStyle(emoji, { fontSize: DEFAULT_FONT_SIZE }),
				label: emoji,
				type: 'emoji' as const,
				fontSize: DEFAULT_FONT_SIZE,
			}));
		}
	}

	$effect(() => {
		styles = entries.map((entry) => entry.style);
		styleMetadata = entries.map(({ type, label, fontSize, fontFamily, textColor, imageWidth, imageHeight }) => ({
			type,
			label,
			fontSize,
			fontFamily,
			textColor,
			imageWidth,
			imageHeight,
		}));
	});

	onMount(initializeDefaults);
</script>

<div class="style-picker">
	<span class="picker-label">{label}</span>

	{#if IS_SHOW_COLORS}
		<div class="section">
			<span class="section-label">Color presets</span>
			<div class="color-swatches">
				{#each DEFAULT_COLORS as color (color)}
					<button
						class="swatch"
						class:is-active={isColorActive(color)}
						style:background-color={color}
						type="button"
						title={color}
						onclick={() => handleToggleColor(color)}>
						{#if isColorActive(color)}
							<svg class="check-icon" viewBox="0 0 16 16" aria-hidden="true">
								<path
									d="M13.5 4.5l-7 7L3 8"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2" />
							</svg>
						{/if}
					</button>
				{/each}
			</div>

			<div class="custom-color-row">
				<input class="color-input" type="color" bind:value={customColor} />
				<span class="color-hex">{customColor}</span>
				<button class="add-button" type="button" onclick={handleAddCustomColor}>Add</button>
			</div>
		</div>
	{/if}

	{#if IS_SHOW_EMOJI}
		<div class="section">
			<span class="section-label">Emoji</span>
			<div class="emoji-presets">
				{#each PRESET_EMOJIS as emoji (emoji)}
					<button class="emoji-pill" type="button" onclick={() => handleAddEmoji(emoji)}>{emoji}</button>
				{/each}
				<div class="size-inline">
					<input
						class="size-input"
						type="number"
						min="12"
						max="64"
						step="1"
						title="Emoji size in pixels"
						bind:value={emojiSize} /><span class="size-unit">px</span>
				</div>
			</div>
		</div>

		<div class="section">
			<span class="section-label">Custom text</span>
			<div class="custom-emoji-row">
				<input class="text-input" type="text" placeholder="Custom text..." bind:value={customEmoji} />
				<select class="font-select" title="Font family" bind:value={customFontFamily}>
					{#each FONT_FAMILIES as font (font)}
						<option value={font}>{font}</option>
					{/each}
				</select>
				<input class="text-color-input" type="color" title="Text color" bind:value={customTextColor} />
				<div class="size-inline">
					<input
						class="size-input"
						type="number"
						min="12"
						max="64"
						step="1"
						title="Text size in pixels"
						bind:value={textSize} /><span class="size-unit">px</span>
				</div>
				<button class="add-button" type="button" onclick={handleAddCustomEmoji}>Add</button>
			</div>
		</div>
	{/if}

	{#if IS_SHOW_IMAGES}
		<div class="section">
			<span class="section-label">Image</span>
			<label class="upload-button">
				<input class="file-input" type="file" accept="image/*" onchange={handleFileUpload} />
				Upload image
			</label>
		</div>
	{/if}

	{#if entries.length > 0}
		<div class="section">
			<span class="section-label">Active ({entries.length})</span>
			<div class="chips-row">
				{#each entries as entry, index (entry.label)}
					{#if entry.type === 'image'}
						<div class="chip chip-image-row">
							<span class="chip-image-label">img</span>
							<span class="chip-image-name">{entry.label}</span>
							<div class="size-inline">
								<input
									class="size-input"
									value={entry.imageWidth ?? 'auto'}
									type="text"
									placeholder="auto"
									title="Width (number or auto)"
									onchange={(e) => handleImageWidthChange(index, (e.target as HTMLInputElement).value)} /><span
									class="size-unit">w</span>
							</div>
							<div class="size-inline">
								<input
									class="size-input"
									value={entry.imageHeight ?? 'auto'}
									type="text"
									placeholder="auto"
									title="Height (number or auto)"
									onchange={(e) => handleImageHeightChange(index, (e.target as HTMLInputElement).value)} /><span
									class="size-unit">h</span>
							</div>
							<button class="chip-remove" type="button" title="Remove" onclick={() => handleRemoveEntry(index)}
								>&times;</button>
						</div>
					{:else}
						<div class="chip">
							{#if entry.type === 'color'}
								<span class="chip-swatch" style:background-color={entry.label}></span>
							{:else}
								<span class="chip-emoji">{entry.label}</span>
							{/if}
							<button class="chip-remove" type="button" title="Remove" onclick={() => handleRemoveEntry(index)}
								>&times;</button>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.style-picker {
		display: flex;
		gap: 0.75rem;
		flex-direction: column;
	}

	.picker-label {
		color: #cbd5e1;
		font-size: 0.875rem;
		user-select: none;
	}

	.section {
		display: flex;
		gap: 0.375rem;
		flex-direction: column;
	}

	.section-label {
		color: #64748b;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		user-select: none;
	}

	.color-swatches {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.swatch {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 24px;
		height: 24px;
		padding: 0;
		border: 2px solid transparent;
		border-radius: 50%;
		transition: border-color 0.15s ease;
		cursor: pointer;
	}

	.swatch.is-active {
		border-color: #e2e8f0;
	}

	.swatch:hover {
		border-color: #94a3b8;
	}

	.check-icon {
		width: 12px;
		height: 12px;
		color: #ffffff;
		filter: drop-shadow(0 1px 1px rgb(0 0 0 / 40%));
	}

	.custom-color-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.color-input {
		width: 28px;
		height: 28px;
		padding: 0;
		border: 1px solid #334155;
		border-radius: 4px;
		background: none;
		cursor: pointer;
	}

	.color-input::-webkit-color-swatch-wrapper {
		padding: 2px;
	}

	.color-input::-webkit-color-swatch {
		border: none;
		border-radius: 2px;
	}

	.color-input::-moz-color-swatch {
		border: none;
		border-radius: 2px;
	}

	.color-hex {
		color: #94a3b8;
		font-family: monospace;
		font-size: 0.75rem;
	}

	.size-inline {
		display: flex;
		align-items: center;
	}

	.size-input {
		width: 3rem;
		padding: 0.15rem 0.3rem;
		border: 1px solid #334155;
		border-radius: 4px 0 0 4px;
		background: #1e293b;
		color: #e2e8f0;
		font-family: monospace;
		font-size: 0.75rem;
		text-align: right;
	}

	.size-input:focus-visible {
		border-color: #818cf8;
		outline: none;
		box-shadow: 0 0 0 2px rgb(129 140 248 / 30%);
	}

	.size-unit {
		padding: 0.15rem 0.3rem;
		border: 1px solid #334155;
		border-left: none;
		border-radius: 0 4px 4px 0;
		background: #334155;
		color: #94a3b8;
		font-family: monospace;
		font-size: 0.75rem;
		line-height: 1.35;
		user-select: none;
	}

	.emoji-presets {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.emoji-pill {
		padding: 0.15rem 0.5rem;
		border: 1px solid #334155;
		border-radius: 999px;
		background: #1e293b;
		font-size: 1rem;
		transition:
			border-color 0.15s ease,
			background-color 0.15s ease;
		cursor: pointer;
	}

	.emoji-pill:hover {
		border-color: #818cf8;
		background: #334155;
	}

	.custom-emoji-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.text-input {
		flex: 1 1 auto;
		min-width: 0;
		padding: 0.3rem 0.5rem;
		border: 1px solid #334155;
		border-radius: 4px;
		outline: none;
		background: #1e293b;
		color: #e2e8f0;
		font-size: 0.8rem;
	}

	.text-input:focus-visible {
		border-color: #818cf8;
		box-shadow: 0 0 0 2px rgb(129 140 248 / 30%);
	}

	.text-input::placeholder {
		color: #475569;
	}

	.font-select {
		flex: 0 0 auto;
		max-width: 8rem;
		padding: 0.2rem 0.3rem;
		border: 1px solid #334155;
		border-radius: 4px;
		background: #1e293b;
		color: #e2e8f0;
		font-size: 0.7rem;
	}

	.font-select:focus-visible {
		border-color: #818cf8;
		outline: none;
		box-shadow: 0 0 0 2px rgb(129 140 248 / 30%);
	}

	.text-color-input {
		width: 24px;
		height: 24px;
		padding: 0;
		border: 1px solid #334155;
		border-radius: 4px;
		background: none;
		cursor: pointer;
	}

	.text-color-input::-webkit-color-swatch-wrapper {
		padding: 2px;
	}

	.text-color-input::-webkit-color-swatch {
		border: none;
		border-radius: 2px;
	}

	.text-color-input::-moz-color-swatch {
		border: none;
		border-radius: 2px;
	}

	.add-button {
		flex: 0 0 auto;
		padding: 0.3rem 0.65rem;
		border: 1px solid #334155;
		border-radius: 4px;
		background: #1e293b;
		color: #cbd5e1;
		font-size: 0.75rem;
		transition:
			border-color 0.15s ease,
			background-color 0.15s ease;
		cursor: pointer;
	}

	.add-button:hover {
		border-color: #818cf8;
		background: #334155;
	}

	.upload-button {
		display: inline-flex;
		gap: 0.375rem;
		align-items: center;
		width: fit-content;
		padding: 0.3rem 0.65rem;
		border: 1px solid #334155;
		border-radius: 4px;
		background: #1e293b;
		color: #cbd5e1;
		font-size: 0.75rem;
		transition:
			border-color 0.15s ease,
			background-color 0.15s ease;
		cursor: pointer;
	}

	.upload-button:hover {
		border-color: #818cf8;
		background: #334155;
	}

	.file-input {
		position: absolute;
		overflow: hidden;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.chips-row {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.chip {
		display: flex;
		gap: 0.25rem;
		align-items: center;
		padding: 0.15rem 0.25rem 0.15rem 0.4rem;
		border: 1px solid #334155;
		border-radius: 999px;
		background: #1e293b;
		color: #cbd5e1;
		font-size: 0.75rem;
	}

	.chip-swatch {
		display: inline-block;
		width: 14px;
		height: 14px;
		border-radius: 50%;
	}

	.chip-emoji {
		font-size: 0.875rem;
		line-height: 1;
	}

	.chip-image-row {
		gap: 0.375rem;
		padding: 0.25rem 0.25rem 0.25rem 0.4rem;
		border-radius: 6px;
	}

	.chip-image-label {
		color: #94a3b8;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.chip-image-name {
		overflow: hidden;
		max-width: 6rem;
		color: #94a3b8;
		font-size: 0.65rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chip-remove {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 16px;
		height: 16px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: #64748b;
		font-size: 0.875rem;
		line-height: 1;
		transition: color 0.15s ease;
		cursor: pointer;
	}

	.chip-remove:hover {
		color: #f87171;
	}
</style>
