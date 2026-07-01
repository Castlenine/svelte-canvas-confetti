# Contributing to `@castlenine/svelte-canvas-confetti`

Thank you for your interest in contributing!

Whether you are reporting a bug, suggesting a feature, or submitting a pull request, your help is appreciated.

## Prerequisites

| Requirement                    | Version | Notes                                                                     |
| ------------------------------ | ------- | ------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/) | v22+    | See `.nvmrc` for the exact version                                        |
| [pnpm](https://pnpm.io/)       | 11+     | Avoid using `npm install` and `yarn install` — use `pnpm install` instead |

## Getting Started

1. [Fork](https://github.com/Castlenine/svelte-canvas-confetti/fork) the repository.
2. Clone your fork locally:

  ```shell
   git clone https://github.com/<your-username>/svelte-canvas-confetti.git
   cd svelte-canvas-confetti
  ```

3. Install dependencies and prepare the development environment:

  ```shell
   pnpm install
   pnpm dev:prepare
  ```

  `pnpm dev:prepare` enforces pnpm, runs `svelte-kit sync`, and installs git hooks via Lefthook. Run it once after `pnpm install`.
4. Start the development server:

  ```shell
   pnpm dev
  ```

  The demo app will be available at `http://localhost:5173`.

## Development Workflow

1. Create a branch from the appropriate base branch:

| Base branch | Use for                     |
| ----------- | --------------------------- |
| `main`      | Current version (Svelte 5)  |
| `v1/main`   | Legacy support (Svelte 3/4) |

You will later open your pull request against the matching branch (`development` or `v1/development`) — see [Pull Requests](#pull-requests).

2. Make your changes.
3. Push your branch and open a pull request.

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by [Commitlint](https://commitlint.js.org/).

Optionally, you can use `pnpm commit` to launch the interactive Commitizen prompt, which guides you through the format.

**Format:** `type(scope): subject`

### Allowed Commit Types

| Type              | Description                                        |
| ----------------- | -------------------------------------------------- |
| `feat`            | A new feature or improvement                       |
| `fix`             | A bug fix or issue resolution                      |
| `hotfix`          | An urgent fix for a critical production issue      |
| `docs`            | Changes to documentation                           |
| `style`           | Code formatting changes (no logic changes)         |
| `refactor`        | Code restructuring without behavior changes        |
| `perf`            | Performance optimization                           |
| `test`            | Adding or improving tests                          |
| `build`           | Modifications to build systems or processes        |
| `ci`              | Updates to CI/CD configuration                     |
| `chore`           | Routine maintenance tasks                          |
| `config`          | Modifications to configuration files               |
| `security`        | Security vulnerability fixes or enhancements       |
| `comment`         | Modifications or additions to code comments        |
| `prune`           | Removal of unnecessary files or cleanup            |
| `revert`          | Rolls back a previous commit                       |
| `merge`           | Merges changes from one branch into another        |
| `cherry-pick`     | Cherry-picks a specific commit                     |
| `translation`     | Adds or updates translations                       |
| `version`         | Updates project version metadata                   |
| `wip`             | Work in progress                                   |
| `temp`            | Provisional commit marked for cleanup before merge |
| `BREAKING-CHANGE` | A change that breaks backward compatibility        |

## Code Quality

[Lefthook](https://github.com/evilmartians/lefthook) git hooks run automatically on each commit, but you can also run these tools manually:

| Tool                 | Command              | Purpose                                              |
| -------------------- | -------------------- | ---------------------------------------------------- |
| ESLint               | `pnpm lint:fix`      | Lint and auto-fix TypeScript, JavaScript, and Svelte |
| Prettier             | `pnpm format`        | Format all files                                     |
| Stylelint            | `pnpm stylelint:fix` | Lint and auto-fix CSS and Svelte styles              |
| svelte-check         | `pnpm check`         | Type-check Svelte components and TypeScript          |
| **All of the above** | `pnpm clean-code`    | Run Stylelint, ESLint, and Prettier in sequence      |

## Pull Requests

- Target the correct branch:

  | Branch           | Use for                     |
  | ---------------- | --------------------------- |
  | `development`    | Current version (Svelte 5)  |
  | `v1/development` | Legacy support (Svelte 3/4) |

- Use a descriptive title following the commit convention format (e.g., `feat: add sparkle particle shape`).
- Include a clear description of what changed and why.
- Ensure all linting and type checks pass before requesting a review.

## Reporting Issues

- [Report a bug](https://github.com/Castlenine/svelte-canvas-confetti/issues/new?template=bug-report.yml)
- [Request a feature](https://github.com/Castlenine/svelte-canvas-confetti/issues/new?template=feature-request.yml)

## AI Disclosure

Using LLMs, AI agents, or similar tools during development is perfectly fine. What matters is transparency.

As the maintainer, I use AI agents to challenge my own biases, review technical approaches, and mostly for grammar correction.

Being open about this helps everyone understand how the code was written and why we made specific decisions.

If you used AI tools while working on your contribution, please mention it in your pull request. A brief note is enough — for example, which tool you used and how it helped (code generation, refactoring suggestions, documentation drafting, etc.).

**This is not about gatekeeping; it is about maintaining a clear and honest record of how the project evolves.**

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
