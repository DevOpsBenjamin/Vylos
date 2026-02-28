# @vylos/cli

CLI tooling for [Vylos](https://github.com/DevOpsBenjamin/Vylos) — scaffold, develop, and build visual novel projects.

[![npm](https://img.shields.io/npm/v/@vylos/cli)](https://www.npmjs.com/package/@vylos/cli)

## Install

```bash
pnpm add -D @vylos/cli
```

Requires Node.js >= 22.0.0.

## Quick Start

```bash
# Scaffold a new project
npx vylos create my-game
cd my-game
pnpm install
pnpm dev
```

This generates a ready-to-run project with:

```
my-game/
├── main.ts                          # Bootstrap
├── vylos.config.ts                  # Project metadata
├── plugins/my-game/                 # Your game types
│   ├── index.ts                     # Barrel export
│   ├── characters.ts                # Character extends VylosCharacter
│   ├── player.ts                    # Player extends Character
│   └── gameState.ts                 # GameState extends VylosGameState
├── locations/home/location.ts       # Starter location
├── global/events/intro.ts           # Intro event
└── global/actions/wait.ts           # Wait action
```

All imports use the `@game` alias — no relative path mess:

```typescript
import type { GameState } from '@game';
import { narrator } from '@game';
```

## Commands

| Command | Description |
|---------|-------------|
| `vylos create <name>` | Scaffold a new project |
| `vylos dev [dir]` | Start Vite dev server |
| `vylos build [dir]` | Build single-file HTML for production |

## How it works

The CLI wraps Vite with pre-configured plugins for Vue, Tailwind CSS v4, and single-file HTML output. It automatically resolves the `@game` alias by scanning the `plugins/` directory, so the tsconfig path and Vite alias stay in sync.

## Documentation

Full docs and examples: [github.com/DevOpsBenjamin/Vylos](https://github.com/DevOpsBenjamin/Vylos)

## License

[MIT](https://github.com/DevOpsBenjamin/Vylos/blob/main/LICENSE)
