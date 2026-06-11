<div align="center">

# `@castlenine/svelte-canvas-confetti`

[![npm.badge]][npm] [![download.badge]][download] [![contribution.badge]][contribution]

Canvas-based confetti for Svelte 🎉, with no dependencies.
</div>

## Features

* Uses a single canvas to render full-screen confetti.
* Supports image-based confetti.
* Allows full customization of confetti behavior using the `onCreate` and `onUpdate` hooks.

## 🚀 [Demo](https://svelte-canvas-confetti.vercel.app/)

## Installation

Use your package manager to install:

```shell
npm i @castlenine/svelte-canvas-confetti
```

## Compatibility

| Package version | Svelte version | Production Branch | Development Branch |
|---|---|---|---|
| `v5.x.y` (`latest`) | Svelte 5 | `main` | `development` |
| `v1.x.y` (`legacy`) | Svelte 3 / 4 | `v1/main` | `v1/development` |

## Basic Usage

The package includes four Svelte components.

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

### Confetti

Adds any type of confetti. This is the main component, and the other three are simple wrappers around it.

If no properties are passed in, it will behave the same as **FallingConfetti**.

```svelte
<script>
  import { Confetti } from '@castlenine/svelte-canvas-confetti';
</script>

<Confetti />
```

## Image Handling

You can use images instead of colors by passing `HTMLImageElement` instances to the `styles` prop. It is recommended to use [Vite's built-in asset handling](https://vite.dev/guide/assets) to import images from `$lib/assets` — this ensures proper asset hashing, inlining of small files, and build-time optimization.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  import { FallingConfetti } from '@castlenine/svelte-canvas-confetti';

  import SmallLogo from '$lib/assets/logos/logo-small.png';

  let imageLogo: HTMLImageElement | null = null;
  let showConfetti = false;

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
    on:completed={() => {
      showConfetti = false;
    }} />
{/if}
```

The image import path can be placed wherever appropriate in your project, using any alias you prefer (e.g., `$lib/assets/images/`, `$lib/assets/logos/`, `$assets/images/`).

## Props

### particleCount

The number of particles to create.

**Type:** `number`
**Default value:** `50`
**Example:**

```svelte
<Confetti particleCount={100} />
```

### styles

A list of styles used to render particles. Can be any valid HTML color or an `HTMLImageElement`.

**Type:** `readonly ParticleStyle[]`
**Default value:** `['hotpink', 'gold', 'dodgerblue', 'tomato', 'rebeccapurple', 'lightgreen', 'turquoise']`
**Example:**

```svelte
<Confetti styles={['red', '#00ff00', 'hsl(120, 65%, 85%)']} />
```

### origin

The origin of the particles. If this is not provided, the particles will fall from the top of the screen.

**Type:** `Position`
**Default value:** `undefined`
**Example:**

```svelte
<Confetti origin={[100, 100]} />
```

### force

The initial force used to shoot out confetti. This has no effect if `origin` is not used.

**Type:** `number`
**Default value:** 15
**Example:**

```svelte
<Confetti origin={[50, 50]} force={25} />
```

### angle

The angle used to shoot out confetti. This has no effect if `origin` is not used. Can be combined with `spread` to create a "cannon" effect.

**Type:** `number`
**Default value:** 0
**Example:**

```svelte
<Confetti origin={[50, 50]} angle={90} />
```

### spread

The spread used when creating each particle’s initial direction. The particle's initial direction will be a value between `angle - spread / 2` and `angle + spread / 2`. This has no effect if `origin` is not used.

**Type:** `number`
**Default value:** 360
**Example:**

```svelte
<Confetti origin={[100, 100]} spread={45} />
```

### onCreate

This can be used to override the properties of each particle at creation time.

**Type:** `(particle) => particle`
**Default value:** `undefined`
**Example:**

```svelte
<Confetti
  onCreate={(particle) => {
    particle.x = 0;
    particle.y = 0;

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

### on:completed

An event dispatched when all particles have exited the screen.

**Type:** `() => void`
**Example:**

```svelte
<script>
  import { Confetti } from '@castlenine/svelte-canvas-confetti';

  let showConfetti = true;
</script>

{#if showConfetti}
  <Confetti on:completed={() => { showConfetti = false; }} />
{/if}
```

## Particle Object

```typescript
interface Particle {
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

  // The width of the particle (not used with images).
  w: number;

  // The height of the particle (not used with images).
  h: number;

  // Vertical gravity.
  gy: number;

  // The "width" of the falling motion. The falling motion is calculated as Math.sin(life * xw).
  xw: number;

  // The style of the particle. Either an HTML color or an HTMLImageElement.
  style: ParticleStyle;
}
```

## Exported Types

The following types are exported from the package:

```typescript
import type { Particle, ParticleStyle, Position, OnCreateParticle, OnUpdateParticle } from '@castlenine/svelte-canvas-confetti';
```

| Type | Description |
| --- | --- |
| `Particle` | The particle object used in `onCreate` and `onUpdate` callbacks. |
| `ParticleStyle` | `string \| HTMLImageElement` — a valid HTML color or an image element. |
| `Position` | `[number, number]` — an `[x, y]` coordinate tuple. |
| `OnCreateParticle` | `(p: Particle) => Particle` — callback to customize particles at creation. |
| `OnUpdateParticle` | `(p: Particle, dt: number) => void` — callback to modify particles each frame. |

---

Forked from [andreasmcdermott/svelte-canvas-confetti](https://github.com/andreasmcdermott/svelte-canvas-confetti)

[npm]: https://www.npmjs.com/package/@castlenine/svelte-canvas-confetti
[npm.badge]: https://img.shields.io/npm/v/@castlenine/svelte-canvas-confetti
[download]: https://www.npmjs.com/package/@castlenine/svelte-canvas-confetti
[download.badge]: https://img.shields.io/npm/d18m/@castlenine/svelte-canvas-confetti
[contribution]: https://github.com/castlenine/svelte-canvas-confetti
[contribution.badge]: https://img.shields.io/badge/contributions-welcome-green
