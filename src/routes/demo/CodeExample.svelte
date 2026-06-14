<!--
@component
Code example viewer for the confetti demo page. Dynamically generates a Svelte code snippet
showing how to use the currently configured effect, with syntax highlighting and a copy button.

&nbsp;

@prop activeTab {'falling' | 'burst' | 'cannon' | 'sparkle' | 'fireworks' | 'parachutes' | 'emoji'} - Currently active demo effect tab.
@prop particleCount {number} - Number of particles.
@prop styleMetadata {readonly { type: string; label: string; fontSize?: number; textColor?: string; imageWidth?: number | null; imageHeight?: number | null }[]} - Metadata for active particle styles from StylePicker.
@prop emojiStyleMetadata {readonly { type: string; label: string; fontSize?: number; textColor?: string }[]} - Metadata for emoji tab styles from StylePicker.
@prop burstOrigin {Position} - Origin point for burst effect.
@prop sparkleDuration {number} - Duration in seconds for sparkle effect.
@prop sparkleSpeed {number} - Speed multiplier for sparkle effect.
@prop sparkleArea {Position} - Area dimensions for sparkle effect.
@prop sparkleAreaOrigin {Position} - Area origin for sparkle effect.
@prop fireworkCount {number} - Number of fireworks to launch.
@prop fireworkBurstForce {number} - Burst force for fireworks.
@prop fireworkLaunchForce {number} - Launch force for fireworks.
@prop fireworkStaggerDelay {number} - Delay between firework launches in milliseconds.
@prop fireworkRocketColor {string} - Color of the firework rocket trail.
@prop emojiOrigin {Position} - Origin point for emoji burst effect.
@prop cannonOrigin {Position} - Origin point for cannon effect.
@prop cannonForce {number} - Launch force for cannon effect.
@prop cannonAngle {number} - Launch angle in degrees for cannon effect.
@prop cannonSpread {number} - Spread angle in degrees for cannon effect.
@prop particleWidth {number | null} - Particle width override (null = auto).
@prop particleHeight {number | null} - Particle height override (null = auto).
@prop particleGravity {number | null} - Particle gravity override (null = auto).
@prop particleOpacity {number | null} - Particle opacity override (null = auto).
@prop particleSway {number | null} - Particle sway/wind override (null = auto).
@prop particleRotation {number | null} - Particle rotation speed override (null = auto).
@prop particleDelay {number | null} - Particle stagger delay override (null = auto).
-->

<script lang="ts">
	import type { Position } from '$lib/utils/types';

	interface StyleMeta {
		type: string;
		label: string;
		fontSize?: number;
		fontFamily?: string;
		textColor?: string;
		imageWidth?: number | null;
		imageHeight?: number | null;
	}

	interface EmojiStyleMeta {
		type: string;
		label: string;
		fontSize?: number;
		fontFamily?: string;
		textColor?: string;
	}

	interface Props {
		activeTab: 'falling' | 'burst' | 'cannon' | 'sparkle' | 'fireworks' | 'parachutes' | 'emoji';
		particleCount: number;
		styleMetadata: readonly StyleMeta[];
		emojiStyleMetadata: readonly EmojiStyleMeta[];
		burstOrigin: Position;
		sparkleDuration: number;
		sparkleSpeed: number;
		sparkleArea: Position;
		sparkleAreaOrigin: Position;
		fireworkCount: number;
		fireworkBurstForce: number;
		fireworkLaunchForce: number;
		fireworkStaggerDelay: number;
		fireworkRocketColor: string;
		emojiOrigin: Position;
		particleWidth: number | null;
		particleHeight: number | null;
		particleGravity: number | null;
		particleOpacity: number | null;
		particleSway: number | null;
		particleRotation: number | null;
		particleDelay: number | null;
		cannonOrigin: Position;
		cannonForce: number;
		cannonAngle: number;
		cannonSpread: number;
	}

	const {
		activeTab,
		particleCount,
		styleMetadata,
		emojiStyleMetadata,
		burstOrigin,
		sparkleDuration,
		sparkleSpeed,
		sparkleArea,
		sparkleAreaOrigin,
		fireworkCount,
		fireworkBurstForce,
		fireworkLaunchForce,
		fireworkStaggerDelay,
		fireworkRocketColor,
		emojiOrigin,
		particleWidth,
		particleHeight,
		particleGravity,
		particleOpacity,
		particleSway,
		particleRotation,
		particleDelay,
		cannonOrigin,
		cannonForce,
		cannonAngle,
		cannonSpread,
	}: Props = $props();

	let isCopied = $state(false);

	const CODE = $derived.by(() => generateCode());
	const HIGHLIGHTED_CODE = $derived(highlightSyntax(CODE));
	const DEFAULT_COLORS = [
		'hotpink',
		'gold',
		'dodgerblue',
		'tomato',
		'rebeccapurple',
		'lightgreen',
		'turquoise',
	] as const;
	const PACKAGE_NAME = '@castlenine/svelte-canvas-confetti';

	let copyTimeoutId: number | undefined;

	interface FormattedStyleResult {
		imports: string[];
		setupCode: string;
		stylesExpr: string;
		hasAsync: boolean;
		onCreateCode: string;
	}

	function formatPosition(position: Position): string {
		return `[${position[0]}, ${position[1]}]`;
	}

	function formatTextStyleCall(entry: {
		label: string;
		fontSize?: number;
		fontFamily?: string;
		textColor?: string;
	}): string {
		const OPTIONS_PARTS: string[] = [];

		if (entry.fontSize != null) OPTIONS_PARTS.push(`fontSize: ${entry.fontSize}`);
		if (entry.fontFamily != null && entry.fontFamily !== 'sans-serif')
			OPTIONS_PARTS.push(`fontFamily: '${entry.fontFamily}'`);

		if (entry.textColor != null) OPTIONS_PARTS.push(`color: '${entry.textColor}'`);

		const OPTIONS_STR = OPTIONS_PARTS.length > 0 ? `, { ${OPTIONS_PARTS.join(', ')} }` : '';

		return `createTextStyle('${entry.label}'${OPTIONS_STR})`;
	}

	function isDefaultStyles(entries: readonly StyleMeta[]): boolean {
		if (entries.length !== DEFAULT_COLORS.length) return false;

		return entries.every((entry, index) => entry.type === 'color' && entry.label === DEFAULT_COLORS[index]);
	}

	function formatStyleMetadata(entries: readonly StyleMeta[]): FormattedStyleResult {
		const COLORS = entries.filter((entry) => entry.type === 'color');
		const EMOJIS = entries.filter((entry) => entry.type === 'emoji');
		const IMAGES = entries.filter((entry) => entry.type === 'image');

		const IS_COLORS_ONLY = EMOJIS.length === 0 && IMAGES.length === 0;

		if (IS_COLORS_ONLY) {
			const ITEMS = COLORS.map((entry) => `'${entry.label}'`).join(', ');

			return {
				imports: [],
				setupCode: '',
				stylesExpr: `[${ITEMS}]`,
				hasAsync: false,
				onCreateCode: '',
			};
		}

		const IMPORTS: string[] = [];
		const STYLE_ITEMS: string[] = [];
		const SETUP_LINES: string[] = [];
		let hasAsync = false;
		const ON_CREATE_DIMS: { w?: number; h?: number } = {};

		// Colors as inline strings
		COLORS.forEach((entry) => {
			STYLE_ITEMS.push(`'${entry.label}'`);
		});

		// Emoji/text entries need createTextStyle
		if (EMOJIS.length > 0) {
			IMPORTS.push('createTextStyle');

			EMOJIS.forEach((entry) => {
				STYLE_ITEMS.push(formatTextStyleCall(entry));
			});
		}

		// Image entries need onMount + Image loading
		if (IMAGES.length > 0) {
			hasAsync = true;

			IMAGES.forEach((entry, index) => {
				const VAR_NAME = IMAGES.length === 1 ? 'IMAGE' : `IMAGE_${index + 1}`;

				if (index === 0) {
					SETUP_LINES.push(`    // For optimized imports, use $lib/assets — see README:`);
					SETUP_LINES.push(
						`    // https://github.com/Castlenine/svelte-canvas-confetti?tab=readme-ov-file#image-handling`,
					);
				}

				if (index >= 1) {
					SETUP_LINES.push('');
				}

				SETUP_LINES.push(`    const ${VAR_NAME} = new Image();`);
				SETUP_LINES.push(`    ${VAR_NAME}.src = 'path/to/${entry.label}';`);
				SETUP_LINES.push(`    await ${VAR_NAME}.decode();`);
				STYLE_ITEMS.push(VAR_NAME);

				// Capture custom dimensions from the first image with overrides
				if (entry.imageWidth != null && ON_CREATE_DIMS.w == null) {
					ON_CREATE_DIMS.w = entry.imageWidth;
				}

				if (entry.imageHeight != null && ON_CREATE_DIMS.h == null) {
					ON_CREATE_DIMS.h = entry.imageHeight;
				}
			});
		}

		const STYLES_ARRAY = `[${STYLE_ITEMS.join(', ')}]`;
		let onCreateCode = '';

		if (ON_CREATE_DIMS.w != null || ON_CREATE_DIMS.h != null) {
			const DIMS_PARTS: string[] = [];

			if (ON_CREATE_DIMS.w != null) DIMS_PARTS.push(`w: ${ON_CREATE_DIMS.w}`);
			if (ON_CREATE_DIMS.h != null) DIMS_PARTS.push(`h: ${ON_CREATE_DIMS.h}`);

			onCreateCode = `onCreate={(p) => ({ ...p, ${DIMS_PARTS.join(', ')} })}`;
		}

		if (hasAsync) {
			return {
				imports: IMPORTS,
				setupCode: SETUP_LINES.join('\n'),
				stylesExpr: STYLES_ARRAY,
				hasAsync: true,
				onCreateCode,
			};
		}

		return {
			imports: IMPORTS,
			setupCode: '',
			stylesExpr: STYLES_ARRAY,
			hasAsync: false,
			onCreateCode,
		};
	}

	function formatParticleOnCreate(): string {
		const PARTS: string[] = [];

		if (particleWidth != null) PARTS.push(`w: ${particleWidth}`);
		if (particleHeight != null) PARTS.push(`h: ${particleHeight}`);
		if (particleGravity != null) PARTS.push(`gy: ${particleGravity}`);
		if (particleOpacity != null) PARTS.push(`opacity: ${particleOpacity}`);
		if (particleSway != null) PARTS.push(`xw: ${particleSway}`);
		if (particleRotation != null) PARTS.push(`da: ${particleRotation}`);
		if (particleDelay != null) PARTS.push(`delay: ${particleDelay}`);

		if (PARTS.length === 0) return '';

		return `onCreate={(p) => ({ ...p, ${PARTS.join(', ')} })}`;
	}

	function mergeOnCreateCodes(imageOnCreate: string, particleOnCreate: string): string {
		if (imageOnCreate === '' && particleOnCreate === '') return '';
		if (imageOnCreate === '') return particleOnCreate;
		if (particleOnCreate === '') return imageOnCreate;

		return particleOnCreate;
	}

	function generateCode(): string {
		switch (activeTab) {
			case 'falling':
				return generateFallingCode();

			case 'burst':
				return generateBurstCode();

			case 'cannon':
				return generateCannonCode();

			case 'sparkle':
				return generateSparkleCode();

			case 'fireworks':
				return generateFireworksCode();

			case 'parachutes':
				return generateParachutesCode();

			case 'emoji':
				return generateEmojiCode();

			default:
				throw new Error(`Unhandled tab: "${activeTab as string}"`);
		}
	}

	function buildEffectCode(componentName: string, componentImportName: string, extraProps: string[]): string {
		const RESULT = formatStyleMetadata(styleMetadata);
		const PARTICLE_ON_CREATE = formatParticleOnCreate();
		const MERGED_ON_CREATE = mergeOnCreateCodes(RESULT.onCreateCode, PARTICLE_ON_CREATE);
		const HAS_SETUP = RESULT.hasAsync || RESULT.imports.length > 0;

		if (!HAS_SETUP) {
			const PROPS: string[] = [...extraProps];

			if (!isDefaultStyles(styleMetadata) && RESULT.stylesExpr !== '[]') PROPS.push(`  styles={${RESULT.stylesExpr}}`);
			if (MERGED_ON_CREATE !== '') PROPS.push(`  ${MERGED_ON_CREATE}`);

			const PROPS_BLOCK = PROPS.length > 0 ? `\n${PROPS.join('\n')}\n` : ' ';

			return `<script>
  import { ${componentImportName} } from '${PACKAGE_NAME}';
\x3C/script>

<${componentName}${PROPS_BLOCK}/>`;
		}

		const IMPORT_PARTS = [componentImportName, ...RESULT.imports];
		const SVELTE_IMPORTS: string[] = [];

		SVELTE_IMPORTS.push('onMount');

		const SVELTE_IMPORT_LINE =
			SVELTE_IMPORTS.length > 0 ? `  import { ${SVELTE_IMPORTS.join(', ')} } from 'svelte';\n` : '';

		const COMPONENT_PROPS: string[] = [...extraProps];

		COMPONENT_PROPS.push(`  styles={confettiStyles}`);

		if (MERGED_ON_CREATE !== '') COMPONENT_PROPS.push(`  ${MERGED_ON_CREATE}`);

		const SETUP_BODY = RESULT.setupCode === '' ? '\n' : `\n${RESULT.setupCode}\n`;

		const MOUNT_BODY = RESULT.hasAsync
			? `  onMount(async () => {${SETUP_BODY}\n    confettiStyles = ${RESULT.stylesExpr};\n  });`
			: `  onMount(() => {\n    confettiStyles = ${RESULT.stylesExpr};\n  });`;

		return `<script>
${SVELTE_IMPORT_LINE}  import { ${IMPORT_PARTS.join(', ')} } from '${PACKAGE_NAME}';

  let confettiStyles = $state([]);

${MOUNT_BODY}
\x3C/script>

<${componentName}
${COMPONENT_PROPS.join('\n')}
/>`;
	}

	function generateFallingCode(): string {
		const EXTRA_PROPS: string[] = [];

		if (particleCount !== 50) EXTRA_PROPS.push(`  particleCount={${particleCount}}`);

		return buildEffectCode('FallingConfetti', 'FallingConfetti', EXTRA_PROPS);
	}

	function generateBurstCode(): string {
		const EXTRA_PROPS: string[] = [];

		EXTRA_PROPS.push(`  origin={${formatPosition(burstOrigin)}}`);

		if (particleCount !== 50) EXTRA_PROPS.push(`  particleCount={${particleCount}}`);

		return buildEffectCode('ConfettiBurst', 'ConfettiBurst', EXTRA_PROPS);
	}

	function generateCannonCode(): string {
		const EXTRA_PROPS: string[] = [];

		EXTRA_PROPS.push(`  origin={${formatPosition(cannonOrigin)}}`);

		if (particleCount !== 50) EXTRA_PROPS.push(`  particleCount={${particleCount}}`);
		if (cannonForce !== 15) EXTRA_PROPS.push(`  force={${cannonForce}}`);
		if (cannonAngle !== -90) EXTRA_PROPS.push(`  angle={${cannonAngle}}`);
		if (cannonSpread !== 360) EXTRA_PROPS.push(`  spread={${cannonSpread}}`);

		return buildEffectCode('ConfettiCannon', 'ConfettiCannon', EXTRA_PROPS);
	}

	function generateSparkleCode(): string {
		const EXTRA_PROPS: string[] = [];

		if (particleCount !== 40) EXTRA_PROPS.push(`  particleCount={${particleCount}}`);
		if (sparkleDuration !== 3) EXTRA_PROPS.push(`  duration={${sparkleDuration}}`);
		if (sparkleSpeed !== 2) EXTRA_PROPS.push(`  sparkleSpeed={${sparkleSpeed}}`);
		EXTRA_PROPS.push(`  area={${formatPosition(sparkleArea)}}`);

		if (sparkleAreaOrigin[0] !== 0 || sparkleAreaOrigin[1] !== 0) {
			EXTRA_PROPS.push(`  areaOrigin={${formatPosition(sparkleAreaOrigin)}}`);
		}

		return buildEffectCode('ConfettiSparkle', 'ConfettiSparkle', EXTRA_PROPS);
	}

	function generateFireworksCode(): string {
		const EXTRA_PROPS: string[] = [];

		if (fireworkCount !== 3) EXTRA_PROPS.push(`  count={${fireworkCount}}`);
		if (particleCount !== 40) EXTRA_PROPS.push(`  particleCount={${particleCount}}`);
		if (fireworkBurstForce !== 12) EXTRA_PROPS.push(`  burstForce={${fireworkBurstForce}}`);
		if (fireworkLaunchForce !== 25) EXTRA_PROPS.push(`  launchForce={${fireworkLaunchForce}}`);
		if (fireworkStaggerDelay !== 400) EXTRA_PROPS.push(`  staggerDelay={${fireworkStaggerDelay}}`);
		if (fireworkRocketColor !== '#f5f5f5') EXTRA_PROPS.push(`  rocketStyles={['${fireworkRocketColor}']}`);

		return buildEffectCode('ConfettiFireworks', 'ConfettiFireworks', EXTRA_PROPS);
	}

	function generateParachutesCode(): string {
		return `<script>
  import { onMount } from 'svelte';
  import { FallingConfetti } from '${PACKAGE_NAME}';
  import ParachuteImage from '$lib/assets/images/parachute.png';

  let parachuteImg = $state(null);

  onMount(() => {
    const IMAGE = new Image();
    IMAGE.src = ParachuteImage;
    IMAGE.decode().then(() => { parachuteImg = IMAGE; });
  });
\x3C/script>

{#if parachuteImg}
  <FallingConfetti
    particleCount={${particleCount}}
    styles={[parachuteImg]}
    onCreate={(p) => ({ ...p, angle: 0, gy: 2, da: Math.random() * 70 - 35 })}
    onUpdate={(p) => {
      if ((p.angle > 35 && p.da > 0) || (p.angle < -35 && p.da < 0)) p.da *= -1;
    }}
  />
{/if}`;
	}

	function generateEmojiCode(): string {
		const STYLE_CALLS = emojiStyleMetadata.map((entry) => `      ${formatTextStyleCall(entry)},`).join('\n');

		const PARTICLE_ON_CREATE = formatParticleOnCreate();
		const ON_CREATE_LINE = PARTICLE_ON_CREATE === '' ? '' : `\n  ${PARTICLE_ON_CREATE}`;

		return `<script>
  import { onMount } from 'svelte';
  import { ConfettiBurst, createTextStyle } from '${PACKAGE_NAME}';

  let emojiStyles = $state([]);

  onMount(() => {
    emojiStyles = [
${STYLE_CALLS}
    ];
  });
\x3C/script>

<ConfettiBurst
  origin={${formatPosition(emojiOrigin)}}
  particleCount={${particleCount}}
  styles={emojiStyles}${ON_CREATE_LINE}
/>`;
	}

	function highlightSyntax(code: string): string {
		let highlighted = code;

		// HTML-escape
		highlighted = highlighted.replace(/&/g, '&amp;');
		highlighted = highlighted.replace(/</g, '&lt;');
		highlighted = highlighted.replace(/>/g, '&gt;');

		// Comments (// ...)
		highlighted = highlighted.replace(/(\/\/[^\n]*)/g, '<span class="hl-comment">$1</span>');

		// Strings ('...')
		highlighted = highlighted.replace(/'([^']*?)'/g, '<span class="hl-string">\'$1\'</span>');

		// Keywords
		highlighted = highlighted.replace(
			/\b(import|from|let|const|onMount|function|if|return|export)\b/g,
			'<span class="hl-keyword">$1</span>',
		);

		// Svelte runes
		highlighted = highlighted.replace(/(\$state|\$derived)/g, '<span class="hl-keyword">$1</span>');

		// Numbers
		highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>');

		// Component tags: &lt;ComponentName and &lt;/ComponentName
		highlighted = highlighted.replace(/(&lt;\/?[A-Z]\w*)/g, '<span class="hl-tag">$1</span>');

		// Svelte template syntax: {#if, {/if}, {:else}, {#each}, etc.
		highlighted = highlighted.replace(/(\{[#/:][a-z]+\}?)/g, '<span class="hl-tag">$1</span>');

		return highlighted;
	}

	function handleCopy(): void {
		void navigator.clipboard.writeText(CODE).then(() => {
			isCopied = true;
			clearTimeout(copyTimeoutId);
			copyTimeoutId = window.setTimeout(() => {
				isCopied = false;
			}, 2000);
		});
	}
</script>

<h2 class="code-example-title">Code Example</h2>

<div class="code-example">
	<div class="code-block">
		<button class="copy-button" class:is-copied={isCopied} type="button" onclick={handleCopy}>
			{isCopied ? 'Copied!' : 'Copy'}
		</button>
		<!-- eslint-disable-next-line svelte/no-at-html-tags purposely allowing @html here for syntax-highlighted code output -->
		<pre><code>{@html HIGHLIGHTED_CODE}</code></pre>
	</div>
</div>

<style>
	.code-example-title {
		margin: 1rem 0 0;
		font-size: 1.2rem;
		font-weight: 600;
	}

	.code-example {
		display: flex;
		gap: 0.5rem;
		flex-direction: column;
		align-items: center;
		width: 100%;
		max-width: 1000px;
		margin-top: 0.75rem;
	}

	.code-block {
		position: relative;
		width: 100%;
		padding: 1rem;
		border: 1px solid #1e293b;
		border-radius: 8px;
		background: #0d1117;
	}

	pre {
		overflow-x: auto;
		margin: 0;
		color: #c9d1d9;
		font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	code {
		white-space: pre;
	}

	.copy-button {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		padding: 0.2rem 0.5rem;
		border: 1px solid #30363d;
		border-radius: 4px;
		background: #21262d;
		color: #8b949e;
		font-size: 0.7rem;
		transition:
			border-color 0.15s ease,
			color 0.15s ease;
		cursor: pointer;
	}

	.copy-button:hover {
		border-color: #484f58;
		color: #c9d1d9;
	}

	.copy-button.is-copied {
		color: #3fb950;
	}

	:global(.hl-keyword) {
		color: #ff7b72;
	}

	:global(.hl-string) {
		color: #a5d6ff;
	}

	:global(.hl-number) {
		color: #79c0ff;
	}

	:global(.hl-comment) {
		color: #8b949e;
	}

	:global(.hl-tag) {
		color: #7ee787;
	}
</style>
