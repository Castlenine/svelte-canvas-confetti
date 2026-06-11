# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-06-12

### Fixed

- Fixed publish dist-tag not applying (replaced ineffective `publishConfig.tag` with `--tag legacy` in `publish-package` script)

### Removed

- `publishConfig` block from `package.json` (pnpm does not read `publishConfig.tag`)

## [1.2.0] - 2026-06-12

### Breaking Changes

- Removed `random` and `coinFlip` utility re-exports from the public API (`export * from './utils/random'` removed from `index.ts`)

### Changed

- Migrated package manager from npm to pnpm
- Migrated ESLint from `.eslintrc.cjs` (legacy) to `eslint.config.ts` (flat config)
- Refactored `createParticle` function signature from positional parameters to options object (`CreateParticleOptions` interface)
- Refactored `start` function signature from positional parameters to options object (`StartOptions` interface)
- Converted arrow function expressions to named function declarations in core modules
- Changed `Particle` type definition from `type` alias to `interface`
- Made `styles` prop accept `readonly ParticleStyle[]` for stricter type safety
- Applied `as const` to default `COLORS` array
- Added typed event dispatcher (`createEventDispatcher<{ completed: null }>()`)
- Improved internal variable naming (`P` to `PARTICLE`, `x`/`y` to `positionX`/`positionY`, `i` to `index`)
- Removed unnecessary ESLint disable comments (`no-loops/no-loops`, `security/detect-object-injection`)
- Reorganized all export statements to alphabetical order
- Renamed `LICENSE.md` back to `LICENSE`
- Added `publishConfig.tag` set to `legacy` in `package.json`
- Updated Prettier, Stylelint, and TypeScript configurations
- Updated all devDependencies
- Updated `README.md`

### Added

- `publishBranch` set to `v1/main` in `pnpm-workspace.yaml` for legacy version publishing
- Runtime validation error when `styles` array is empty
- HTML comment-based `@component` documentation blocks on all Svelte components
- `lefthook.yaml` for Git hooks automation
- `.commitlintrc.ts` and `.czrc` for conventional commit enforcement
- `.lintstagedrc.json` and `.stylestagedrc.json` for pre-commit linting
- `.ncurc` for dependency update configuration
- `.nvmrc` for Node.js version pinning
- `pnpm-workspace.yaml` for workspace configuration
- `CONTRIBUTING.md` with contribution guidelines
- GitHub issue templates (`bug-report.yml`, `feature-request.yml`) and pull request template

### Removed

- `random` and `coinFlip` utility re-exports from package entry point
- `package-lock.json` (replaced by `pnpm-lock.yaml`)
- `.eslintrc.cjs` (replaced by `eslint.config.ts`)
- `static/airplane.png` demo asset
- Inline JSDoc documentation from Svelte components (replaced by HTML comment blocks)

## [1.1.0] - 2026-06-07

### Changed

- Optimized confetti animation rendering for smoother performance
- Refactored core modules (`particle.ts`, `random.ts`, `types.ts`, `constants.ts`)
- Optimized `parachute.png` asset (reduced file size by ~44%)
- Updated `svelte.config.js`, `tsconfig.json`, and `vite.config.ts`
- Renamed `LICENSE` to `LICENSE.md` and renamed `ACKNOWLEDGEMENT.md` to `ACKNOWLEDGMENT.md`
- Updated `README.md` with corrected grammar
- Updated all devDependencies

### Removed

- `.npmrc` (engine-strict no longer needed for this project)

## [1.0.0] - 2024-05-06

### Added

- Initial production release
- `Confetti` — full-screen canvas-based confetti renderer
- `ConfettiBurst` — confetti burst from a single origin point
- `ConfettiCannon` — directed confetti cannon with angle, spread, and force
- `FallingConfetti` — particles falling from the top of the viewport
- Customizable particle styles with HTML colors or `HTMLImageElement`
- `onCreate` and `onUpdate` callbacks for particle customization
- `on:completed` event dispatched when all particles exit the screen
- TypeScript type exports: `Particle`, `ParticleStyle`, `Position`, `OnCreateParticle`, `OnUpdateParticle`
- `random` and `coinFlip` utility re-exports
- Zero runtime dependencies

[1.2.1]: https://github.com/castlenine/svelte-canvas-confetti/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/castlenine/svelte-canvas-confetti/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/castlenine/svelte-canvas-confetti/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/castlenine/svelte-canvas-confetti/releases/tag/v1.0.0
