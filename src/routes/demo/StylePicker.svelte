<!--
@component
Style picker for selecting confetti particle styles. Supports color presets, custom colors,
emoji presets with independent size control, and custom text input with independent size and color controls.
Also supports image uploads. All style types (colors, emoji, text, images) can be mixed freely
and each entry supports optional per-style width/height overrides. Outputs an array of
ParticleStyleEntry values for use with confetti components.

&nbsp;

@prop styles {ParticleStyleEntry[]} $bindable - Active particle style entries array synced to parent.
@prop styleMetadata {readonly StyleEntryMeta[]} $bindable - Per-entry metadata for code generation (type, label, fontSize, textColor, w, h).
@prop mode {'all' | 'colors' | 'emoji'} ['all'] - Controls which picker sections are visible.
@prop label {string} ['Styles'] - Display label for the picker.
-->

<script lang="ts">
	import type { ParticleStyle, ParticleStyleEntry } from '$lib/utils/types';

	import { onMount } from 'svelte';

	import { createTextStyle } from '$lib/utils/create-text-style';

	interface StyleEntryMeta {
		type: 'color' | 'emoji' | 'text' | 'image';
		label: string;
		fontSize?: number;
		fontFamily?: string;
		textColor?: string;
		w?: number | null;
		h?: number | null;
	}

	interface StyleEntry extends StyleEntryMeta {
		style: ParticleStyle;
	}

	interface Props {
		styles: ParticleStyleEntry[];
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
				type: 'text',
				fontSize: textSize,
				fontFamily: customFontFamily,
				textColor: customTextColor,
			},
		];
		customEmoji = '';
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
					w: null,
					h: null,
				},
			];
		});

		TARGET.value = '';
	}

	function parseDimension(rawValue: string): number | null {
		if (rawValue === '' || rawValue.toLowerCase() === 'auto') return null;

		const PARSED = Number(rawValue);

		if (Number.isNaN(PARSED) || PARSED < 1) return null;

		return Math.min(512, Math.round(PARSED));
	}

	function handleWidthChange(index: number, rawValue: string): void {
		const WIDTH = parseDimension(rawValue);
		entries = entries.map((entry, entryIndex) => (entryIndex === index ? { ...entry, w: WIDTH } : entry));
	}

	function handleHeightChange(index: number, rawValue: string): void {
		const HEIGHT = parseDimension(rawValue);
		entries = entries.map((entry, entryIndex) => (entryIndex === index ? { ...entry, h: HEIGHT } : entry));
	}

	function handleEntryFontSizeChange(index: number, rawValue: string): void {
		const PARSED = Number(rawValue);

		if (Number.isNaN(PARSED) || PARSED < 12 || PARSED > 64) return;

		const SIZE = Math.round(PARSED);
		entries = entries.map((entry, entryIndex) => {
			if (entryIndex !== index) return entry;

			const TEXT = entry.label;
			const OPTIONS =
				entry.type === 'text'
					? { fontSize: SIZE, fontFamily: entry.fontFamily, color: entry.textColor }
					: { fontSize: SIZE };

			return { ...entry, style: createTextStyle(TEXT, OPTIONS), fontSize: SIZE };
		});
	}

	function handleEntryTextColorChange(index: number, newColor: string): void {
		entries = entries.map((entry, entryIndex) => {
			if (entryIndex !== index || entry.type !== 'text') return entry;

			const CANVAS = createTextStyle(entry.label, {
				fontSize: entry.fontSize ?? DEFAULT_FONT_SIZE,
				fontFamily: entry.fontFamily,
				color: newColor,
			});

			return { ...entry, style: CANVAS, textColor: newColor };
		});
	}

	function handleEntryFontFamilyChange(index: number, newFamily: string): void {
		entries = entries.map((entry, entryIndex) => {
			if (entryIndex !== index || entry.type !== 'text') return entry;

			const CANVAS = createTextStyle(entry.label, {
				fontSize: entry.fontSize ?? DEFAULT_FONT_SIZE,
				fontFamily: newFamily,
				color: entry.textColor,
			});

			return { ...entry, style: CANVAS, fontFamily: newFamily };
		});
	}

	function handleRemoveEntry(index: number): void {
		const ENTRY = entries[index];

		if (ENTRY.type === 'image' && ENTRY.style instanceof HTMLImageElement) {
			URL.revokeObjectURL(ENTRY.style.src);
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
		styles = entries.map((entry) => {
			if (entry.w != null || entry.h != null) {
				return { style: entry.style, w: entry.w ?? undefined, h: entry.h ?? undefined };
			}

			return entry.style;
		});

		styleMetadata = entries.map(({ type, label, fontSize, fontFamily, textColor, w, h }) => ({
			type,
			label,
			fontSize,
			fontFamily,
			textColor,
			w,
			h,
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
					<div class="chip chip-sized-row">
						{#if entry.type === 'color'}
							<span class="chip-swatch" style:background-color={entry.label}></span>
						{:else if entry.type === 'image'}
							<span class="chip-image-label">img</span>
							<span class="chip-image-name">{entry.label}</span>
						{:else}
							<span class="chip-emoji">{entry.label}</span>
						{/if}
						{#if entry.type === 'emoji'}
							<div class="size-inline">
								<input
									class="size-input"
									value={entry.fontSize ?? DEFAULT_FONT_SIZE}
									type="number"
									min="12"
									max="64"
									step="1"
									title="Emoji size in pixels"
									onchange={(event) =>
										handleEntryFontSizeChange(index, (event.target as HTMLInputElement).value)} /><span
									class="size-unit">px</span>
							</div>
						{:else if entry.type === 'text'}
							<div class="size-inline">
								<input
									class="size-input"
									value={entry.fontSize ?? DEFAULT_FONT_SIZE}
									type="number"
									min="12"
									max="64"
									step="1"
									title="Text size in pixels"
									onchange={(event) =>
										handleEntryFontSizeChange(index, (event.target as HTMLInputElement).value)} /><span
									class="size-unit">px</span>
							</div>
							<input
								class="chip-color-input"
								value={entry.textColor ?? '#000000'}
								type="color"
								title="Text color"
								onchange={(event) => handleEntryTextColorChange(index, (event.target as HTMLInputElement).value)} />
							<select
								class="chip-font-select"
								value={entry.fontFamily ?? 'sans-serif'}
								title="Font family"
								onchange={(event) => handleEntryFontFamilyChange(index, (event.target as HTMLSelectElement).value)}>
								{#each FONT_FAMILIES as font (font)}
									<option value={font}>{font}</option>
								{/each}
							</select>
						{:else}
							<div class="size-inline">
								<input
									class="size-input"
									value={entry.w ?? 'auto'}
									type="text"
									placeholder="auto"
									title="Width (number or auto)"
									onchange={(event) => handleWidthChange(index, (event.target as HTMLInputElement).value)} /><span
									class="size-unit">w</span>
							</div>
							<div class="size-inline">
								<input
									class="size-input"
									value={entry.h ?? 'auto'}
									type="text"
									placeholder="auto"
									title="Height (number or auto)"
									onchange={(event) => handleHeightChange(index, (event.target as HTMLInputElement).value)} /><span
									class="size-unit">h</span>
							</div>
						{/if}
						<button class="chip-remove" type="button" title="Remove" onclick={() => handleRemoveEntry(index)}
							>&times;</button>
					</div>
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

	.chip-sized-row {
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

	.chip-color-input {
		width: 20px;
		height: 20px;
		padding: 0;
		border: 1px solid #334155;
		border-radius: 4px;
		background: none;
		cursor: pointer;
	}

	.chip-color-input::-webkit-color-swatch-wrapper {
		padding: 1px;
	}

	.chip-color-input::-webkit-color-swatch {
		border: none;
		border-radius: 2px;
	}

	.chip-color-input::-moz-color-swatch {
		border: none;
		border-radius: 2px;
	}

	.chip-font-select {
		max-width: 6rem;
		padding: 0.1rem 0.2rem;
		border: 1px solid #334155;
		border-radius: 4px;
		background: #1e293b;
		color: #e2e8f0;
		font-size: 0.625rem;
	}

	.chip-font-select:focus-visible {
		border-color: #818cf8;
		outline: none;
		box-shadow: 0 0 0 2px rgb(129 140 248 / 30%);
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
