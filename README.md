<div align="center">

# `@castlenine/svelte-canvas-confetti`

[![npm.badge]][npm] [![download.badge]][download] [![contribution.badge]][contribution]

Canvas-based confetti for Svelte 🎉, with no dependencies.
</div>

## Features

* Uses a single canvas to render full-screen confetti.
* Supports image-based, text, and emoji confetti.
* Includes sparkle, fireworks, burst, cannon, and falling effects.
* Particle opacity control for fade and twinkle animations.
* Allows full customization of confetti behavior using the `onCreate` and `onUpdate` hooks.

## 🚀 [Demo & Code Examples](https://svelte-canvas-confetti.vercel.app/)

## Installation

Use your package manager to install:

```shell
npm i @castlenine/svelte-canvas-confetti
```

## Compatibility

| Package version        | Svelte version | Production Branch | Development Branch |
| ---------------------- | -------------- | ----------------- | ------------------ |
| `v5.x.y` (`latest`)    | Svelte 5       | `main`            | `development`      |
| `v1.x.y` (`legacy`)    | Svelte 3 / 4   | `v1/main`         | `v1/development`   |

## Basic Usage

The package includes six Svelte components and a utility function.

### FallingConfetti

Adds confetti falling from the top of the screen.

```svelte
<script>
  import { FallingConfetti } from '@castlenine/svelte-canvas-confetti';
</script>

<FallingConfetti />
```

### ConfettiBurst

Adds a confetti burst anywhere on the screen. Requires an origin position.

```svelte
<script>
  import { ConfettiBurst } from '@castlenine/svelte-canvas-confetti';
</script>

<ConfettiBurst origin={[window.innerWidth / 2, window.innerHeight / 2]} />
```

### ConfettiCannon

Adds a confetti cannon that can shoot directional confetti. Requires an origin position.

```svelte
<script>
  import { ConfettiCannon } from '@castlenine/svelte-canvas-confetti';
</script>

<ConfettiCannon origin={[window.innerWidth / 2, window.innerHeight]} />
```

### ConfettiSparkle

Adds sparkle particles that appear at random positions, twinkle with pulsing opacity, then fade out.

```svelte
<script>
  import { ConfettiSparkle } from '@castlenine/svelte-canvas-confetti';
</script>

<ConfettiSparkle />
```

### ConfettiFireworks

Launches rocket particles upward that explode into confetti bursts at their peak. Supports multiple staggered fireworks.

```svelte
<script>
  import { ConfettiFireworks } from '@castlenine/svelte-canvas-confetti';
</script>

<ConfettiFireworks />
```

### Confetti

Adds any type of confetti. This is the main component, and the others are wrappers around it.

If no properties are passed in, it will behave the same as **FallingConfetti**.

```svelte
<script>
  import { Confetti } from '@castlenine/svelte-canvas-confetti';
</script>

<Confetti />
```

## Image Handling

You can use images instead of colors by passing `HTMLImageElement` instances to the `styles` prop. It is recommended to use [Vite's built-in asset handling](https://svelte.dev/docs/kit/images#Vite's-built-in-handling) to import images from `$lib/assets` — this ensures proper asset hashing, inlining of small files, and build-time optimization.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  import { FallingConfetti } from '@castlenine/svelte-canvas-confetti';

  import SmallLogo from '$lib/assets/logos/logo-small.png';

  let imageLogo = $state<HTMLImageElement | null>(null);
  let showConfetti = $state(false);

  onMount(() => {
    const IMAGE = new Image();
    IMAGE.src = SmallLogo;

    IMAGE.decode()
      .then(() => {
        imageLogo = IMAGE;
        showConfetti = true;
      })

      .catch(() => {
        console.warn('Failed to load confetti image');
      });
  });
</script>

{#if showConfetti && imageLogo}
  <FallingConfetti
    particleCount={142}
    styles={[imageLogo]}
    onCompleted={() => {
      showConfetti = false;
    }} />
{/if}
```

The image import path can be placed wherever appropriate in your project, using any alias you prefer (e.g., `$lib/assets/images/`, `$lib/assets/logos/`, `$assets/images/`).

Image particles default to their original dimensions. To resize them, use a config object with `w` and/or `h` in the `styles` array — see [Per-Style Sizing](#per-style-sizing) for full details and examples.

## Text and Emoji Handling

You can use text or emoji as confetti particles using the `createTextStyle` utility function. It renders text to an offscreen `HTMLCanvasElement` that can be passed to the `styles` prop of any component. Particle dimensions are automatically sized to match the canvas — no `onCreate` callback is needed.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  import { ConfettiBurst, createTextStyle } from '@castlenine/svelte-canvas-confetti';

  import type { ParticleStyle } from '@castlenine/svelte-canvas-confetti';

  let emojiStyles = $state<ParticleStyle[]>([]);
  let showConfetti = $state(false);

  onMount(() => {
    emojiStyles = [
      createTextStyle('🎉', { fontSize: 28 }),
      createTextStyle('⭐', { fontSize: 28 }),
      createTextStyle('❤️', { fontSize: 28 }),
    ];
    showConfetti = true;
  });
</script>

{#if showConfetti}
  <ConfettiBurst
    origin={[window.innerWidth / 2, window.innerHeight / 2]}
    styles={emojiStyles}
    onCompleted={() => { showConfetti = false; }} />
{/if}
```

Since `createTextStyle` uses `document.createElement('canvas')`, it must be called in client-side code (e.g., inside `onMount`).

`createTextStyle` accepts an optional options object:

| Option      | Type      | Default        | Description                                                                                                             |
| ----------- | --------- | -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `fontSize`  | `number`  | `24`           | Font size in pixels. Controls the particle display size — larger values produce larger confetti particles.              |
| `fontFamily`| `string`  | `'sans-serif'` | Font family for text rendering.                                                                                         |
| `color`     | `string`  | `undefined`    | Fill color for text characters. Defaults to black when omitted. Emoji use their native colors regardless of this value. |

### Colored Text

Use the `color` option to set the fill color for text characters:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  import { FallingConfetti, createTextStyle } from '@castlenine/svelte-canvas-confetti';

  import type { ParticleStyle } from '@castlenine/svelte-canvas-confetti';

  let textStyles = $state<ParticleStyle[]>([]);
  let showConfetti = $state(false);

  onMount(() => {
    textStyles = [
      createTextStyle('A', { fontSize: 28, color: 'hotpink' }),
      createTextStyle('B', { fontSize: 28, color: 'dodgerblue' }),
      createTextStyle('C', { fontSize: 28, color: 'gold' }),
    ];
    showConfetti = true;
  });
</script>

{#if showConfetti}
  <FallingConfetti
    styles={textStyles}
    onCompleted={() => { showConfetti = false; }} />
{/if}
```

## Per-Style Sizing

Each entry in the `styles` array can optionally be a config object with `w` (width) and/or `h` (height) to control that style's particle dimensions. This works for all style types — colors, images, and text/canvas.

```svelte
<FallingConfetti
  styles={[
    'hotpink',                             // default random size
    { style: 'gold', w: 20, h: 8 },        // explicit color particle size
    { style: imageLogo, w: 32, h: 32 },    // resized image (both dimensions)
    { style: imageLogo, h: 48 },           // height set, width auto-scales aspect ratio
  ]}
/>
```

**Size behavior by style type:**

| Style type | Both `w` and `h` set | Only `w` set | Only `h` set | Neither set |
| --- | --- | --- | --- | --- |
| Color string | Exact size | `w` set, `h` random | `h` set, `w` random | Both random (default) |
| Image / Canvas | Exact size (may distort) | `w` set, `h` auto-scaled (aspect ratio) | `h` set, `w` auto-scaled (aspect ratio) | Original dimensions |

Config objects can be mixed freely with plain styles in the same array. The `onCreate` callback still runs after config sizing and can override any values.

## Mixing Styles

All style types — color strings, text/emoji (via `createTextStyle`), and images (`HTMLImageElement`) — can be mixed freely in the same `styles` array. Each particle randomly picks one style from the array. Dimensions are handled automatically — use [Per-Style Sizing](#per-style-sizing) for explicit control.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  import { FallingConfetti, createTextStyle } from '@castlenine/svelte-canvas-confetti';

  import type { ParticleStyle } from '@castlenine/svelte-canvas-confetti';

  import SmallLogo from '$lib/assets/logos/logo-small.png';

  let mixedStyles = $state<ParticleStyle[]>([]);
  let showConfetti = $state(false);

  onMount(() => {
    const IMAGE = new Image();
    IMAGE.src = SmallLogo;

    IMAGE.decode()
      .then(() => {
        mixedStyles = [
          'hotpink',
          'dodgerblue',
          'gold',
          createTextStyle('🎉', { fontSize: 28 }),
          createTextStyle('⭐', { fontSize: 28 }),
          createTextStyle('OK', { fontSize: 24, color: 'tomato' }),
          IMAGE,
        ];
        showConfetti = true;
      })

      .catch(() => {
        console.warn('Failed to load confetti image');
      });
  });
</script>

{#if showConfetti}
  <FallingConfetti
    styles={mixedStyles}
    onCompleted={() => { showConfetti = false; }} />
{/if}
```

## Props

The following props are shared across all components. Component-specific props are documented in their own sections below.

### particleCount

The number of particles to create.

**Type:** `number`
**Default value:** `50`
**Example:**

```svelte
<Confetti particleCount={100} />
```

### styles

A list of styles used to render particles. Each entry can be a plain style (any valid HTML color, `HTMLImageElement`, or `CanvasImageSource`) or a config object (`{ style, w?, h? }`) for per-style sizing. All types can be mixed in the same array.

**Type:** `readonly ParticleStyleEntry[]`
**Default value:** `['hotpink', 'gold', 'dodgerblue', 'tomato', 'rebeccapurple', 'lightgreen', 'turquoise']`
**Example:**

```svelte
<!-- Plain styles -->
<Confetti styles={['red', '#00ff00', 'hsl(120, 65%, 85%)']} />

<!-- Config objects for per-style sizing -->
<Confetti styles={[{ style: 'red', w: 20, h: 8 }, { style: '#00ff00', w: 12, h: 12 }]} />
```

### onCreate

Override particle properties at creation time. For static sizing, prefer config objects in the `styles` array (see [Per-Style Sizing](#per-style-sizing)). Use `onCreate` for dynamic per-particle logic (e.g., randomizing sizes at runtime, conditional sizing based on position).

**Type:** `(particle) => particle`
**Default value:** `undefined`
**Example:**

```svelte
<!-- Resize a specific style — image auto-scales width to preserve aspect ratio -->
<Confetti
  styles={['hotpink', imageLogo]}
  onCreate={(particle) => {
    if (particle.style === imageLogo) return { ...particle, h: 48 };
    return particle;
  }}
/>
```

### onUpdate

This can be used to override the properties of each particle at update time.

**Type:** `(particle, deltaTime) => void`
**Default value:** `undefined`
**Example:**

```svelte
<Confetti
  onUpdate={(particle) => {
    particle.x += Math.random() * 5;
  }}
/>
```

### onCompleted

A callback fired when all particles have exited the screen.

**Type:** `() => void`
**Default value:** `undefined`
**Example:**

```svelte
<script>
  import { Confetti } from '@castlenine/svelte-canvas-confetti';

  let showConfetti = $state(true);
</script>

{#if showConfetti}
  <Confetti onCompleted={() => { showConfetti = false; }} />
{/if}
```

## Confetti Props

In addition to the shared props (`styles`, `particleCount`, `onCreate`, `onUpdate`, `onCompleted`), the base `Confetti` component accepts directional controls. The wrapper components (`FallingConfetti`, `ConfettiBurst`, etc.) pre-configure these internally.

| Prop       | Type       | Default     | Description                                                                                                                   |
| ---------- | ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `origin`   | `Position` | `undefined` | Origin position `[x, y]`. When omitted, particles spawn along the top edge (falling behavior).                                |
| `force`    | `number`   | `15`        | Initial velocity. Higher values make particles spread faster and further.                                                     |
| `angle`    | `number`   | `0`         | Burst direction in degrees (`0` = rightward, `-90` = upward).                                                                 |
| `spread`   | `number`   | `360`       | Angular spread in degrees. Each particle's direction is a random value between `angle - spread / 2` and `angle + spread / 2`. |

## FallingConfetti Props

`FallingConfetti` accepts the shared props: `styles`, `particleCount`, `onCreate`, `onUpdate`, `onCompleted`. It does not accept `origin`, `force`, `angle`, or `spread`.

## ConfettiBurst Props

`ConfettiBurst` accepts the shared props (`styles`, `particleCount`, `onCreate`, `onUpdate`, `onCompleted`) plus a required `origin`.

| Prop     | Type       | Default      | Description                                                                            |
| -------- | ---------- | ------------ | -------------------------------------------------------------------------------------- |
| `origin` | `Position` | — (required) | Origin position `[x, y]`. Particles explode outward in all directions from this point. |

## ConfettiCannon Props

`ConfettiCannon` accepts the shared props (`styles`, `particleCount`, `onCreate`, `onUpdate`, `onCompleted`) plus a required `origin` and directional controls.

| Prop     | Type       | Default      | Description                                                                                                                   |
| -------- | ---------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `origin` | `Position` | — (required) | Origin position `[x, y]`. Particles fire from this point in a directed cone.                                                  |
| `force`  | `number`   | `15`         | Initial force used to shoot out confetti. Higher values make particles spread faster and further.                             |
| `angle`  | `number`   | `-90`        | Burst direction in degrees (`-90` = upward). Combine with `spread` to control the cone shape.                                 |
| `spread` | `number`   | `360`        | Angular spread in degrees. Each particle's direction is a random value between `angle - spread / 2` and `angle + spread / 2`. |

## ConfettiSparkle Props

In addition to the shared props (`styles`, `particleCount`, `onCreate`, `onUpdate`, `onCompleted`), `ConfettiSparkle` accepts:

| Prop           | Type       | Default                     | Description                                                         |
| -------------- | ---------- | --------------------------- | ------------------------------------------------------------------- |
| `duration`     | `number`   | `3`                         | Total effect duration in seconds.                                   |
| `area`         | `Position` | `[innerWidth, innerHeight]` | `[width, height]` of the spawn area. Defaults to the full viewport. |
| `areaOrigin`   | `Position` | `[0, 0]`                    | Top-left corner of the spawn area.                                  |
| `sparkleSpeed` | `number`   | `2`                         | Twinkle frequency multiplier. Higher values produce faster pulsing. |

Note: `particleCount` defaults to `40` for this component (not `50`).

## ConfettiFireworks Props

In addition to the shared props (`styles`, `particleCount`, `onCreate`, `onUpdate`, `onCompleted`), `ConfettiFireworks` accepts:

| Prop            | Type                             | Default          | Description                                                                                                                  |
| --------------- | -------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `count`         | `number`                         | `3`              | Number of fireworks to launch.                                                                                               |
| `rocketStyles`  | `readonly ParticleStyleEntry[]`  | `['whitesmoke']` | Render styles for the rocket trail particles. Config object sizes are overridden by the rocket's fixed 4x4 trail dimensions. |
| `burstForce`    | `number`                         | `12`             | Burst explosion velocity. Higher values make particles spread faster and further.                                            |
| `launchForce`   | `number`                         | `25`             | Upward launch velocity of the rocket.                                                                                        |
| `staggerDelay`  | `number`                         | `400`            | Delay in milliseconds between firework launches.                                                                             |

Note: `particleCount` defaults to `40` for this component (not `50`). The `onCreate` and `onUpdate` callbacks are applied to the burst particles only, not the rockets.

## Particle Object

```typescript
export interface Particle {
  // Stop updating/rendering the particle once it is "dead" (i.e., off screen)
  dead: boolean;

  // The total time since the particle was created.
  life: number;

  // The delay between the creation of the particle and when it starts updating/rendering (in seconds).
  delay: number;

  // The x position of the particle.
  x: number;

  // The y position of the particle.
  y: number;

  // The current angle of the particle.
  angle: number;

  // The rotation speed of the particle.
  da: number;

  // The horizontal speed of the particle.
  dx: number;

  // The vertical speed of the particle.
  dy: number;

  // The display width of the particle. Auto-sized from source for image/canvas styles, random for colors.
  w: number;

  // The display height of the particle. Same auto-sizing as w. Set one dimension to preserve aspect ratio.
  h: number;

  // Vertical gravity.
  gy: number;

  // The "width" of the falling motion. The falling motion is calculated as Math.sin(life * xw).
  xw: number;

  // The style of the particle. An HTML color string, HTMLImageElement, or any CanvasImageSource.
  style: ParticleStyle;

  // The opacity of the particle (0 to 1). Defaults to 1 (fully opaque).
  opacity?: number;

  // Internal flag. True when w/h were set via a ParticleStyleConfig object.
  sizeConfigured?: boolean;
}
```

## Exported Types

The following types and utilities are exported from the package:

```typescript
import type { CreateTextStyleOptions, Particle, ParticleStyle, ParticleStyleConfig, ParticleStyleEntry, Position, OnCreateParticle, OnUpdateParticle } from '@castlenine/svelte-canvas-confetti';
import { createTextStyle } from '@castlenine/svelte-canvas-confetti';
```

| Export                   | Description                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `Particle`               | The particle object used in `onCreate` and `onUpdate` callbacks.                                                         |
| `ParticleStyle`          | `string \| CanvasImageSource` — a valid HTML color, `HTMLImageElement`, `HTMLCanvasElement`, or any canvas image source. |
| `ParticleStyleConfig`    | `{ style: ParticleStyle, w?: number, h?: number }` — a style with optional per-style size overrides.                     |
| `ParticleStyleEntry`     | `ParticleStyle \| ParticleStyleConfig` — a plain style or a config object. Used in the `styles` prop.                    |
| `Position`               | `[number, number]` — an `[x, y]` coordinate tuple.                                                                       |
| `OnCreateParticle`       | `(p: Particle) => Particle` — callback to customize particles at creation.                                               |
| `OnUpdateParticle`       | `(p: Particle, dt: number) => void` — callback to modify particles each frame.                                           |
| `CreateTextStyleOptions` | Options for `createTextStyle`: `fontSize`, `fontFamily`, `color`.                                                        |
| `createTextStyle`        | `(text: string, options?) => HTMLCanvasElement` — renders text/emoji to a canvas for use as a particle style.            |

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and development workflow.

---

Forked from [andreasmcdermott/svelte-canvas-confetti](https://github.com/andreasmcdermott/svelte-canvas-confetti)

[npm]: https://www.npmjs.com/package/@castlenine/svelte-canvas-confetti
[npm.badge]: https://img.shields.io/npm/v/@castlenine/svelte-canvas-confetti
[download]: https://www.npmjs.com/package/@castlenine/svelte-canvas-confetti
[download.badge]: https://img.shields.io/npm/d18m/@castlenine/svelte-canvas-confetti
[contribution]: https://github.com/Castlenine/svelte-canvas-confetti
[contribution.badge]: https://img.shields.io/badge/contributions-welcome-green
