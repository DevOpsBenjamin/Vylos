# Vylos

A checkpoint-based visual novel engine for the web, built with Vue 3 and TypeScript.

[![npm](https://img.shields.io/npm/v/@vylos/core)](https://www.npmjs.com/package/@vylos/core)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

- **Checkpoint-based execution** — inline choices with `if/else`, rollback via re-execute + fast-forward (like Ren'Py)
- **Async/await events** — write linear stories with `engine.say()` and `engine.choice()`
- **Rollback & history** — full forward/back navigation through past events
- **Drawable events** — custom canvas-based interactive scenes
- **i18n** — built-in multi-language support with `TextEntry` (`string | Record<string, string>`)
- **Save/load with mid-event resume** — checkpoint system preserves exact position within events
- **Plugin system** — DI-based (tsyringe) manager and component overrides
- **AZERTY/QWERTY auto-detect** — keyboard input adapts automatically
- **Mouse click navigation** — navigate locations by clicking on the scene

## Quick Start

```bash
# Install the CLI
pnpm add -D @vylos/cli

# Scaffold a new project
vylos create my-game

# Start the dev server
vylos dev
```

Requires Node.js >= 22.0.0 and pnpm 9.15+.

## Project Structure

Games follow a file-based convention:

```
my-game/
├── index.html
├── main.ts              # Bootstrap: createApp, createEngine, provide, run
├── style.css            # Tailwind + @source
├── vylos.config.ts      # Project metadata
├── setup.ts             # VylosPlugin (optional)
├── locations/<id>/
│   ├── location.ts      # VylosLocation: id, name, backgrounds (with timeRange)
│   ├── events/          # VylosEvent files
│   ├── actions/         # VylosAction files
│   └── assets/          # Images for this location
└── global/
    ├── events/          # Global events (trigger anywhere)
    ├── actions/         # Global actions (always available)
    └── images/menu/     # Menu background
```

## Event Example

Events are async functions that pause at each `say()` or `choice()`:

```typescript
import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const explore: VylosEvent = {
  id: 'explore_hallway',
  locationId: 'hallway',
  conditions: (state) => state.flags['intro_done'] === true,
  async execute(engine: VylosAPI, state: BaseGameState) {
    await engine.say('The hallway stretches ahead, dimly lit.');

    const pick = await engine.choice([
      { text: 'Go outside', value: 'outside' },
      { text: 'Go back', value: 'room' },
    ]);

    if (pick === 'outside') {
      await engine.say('You push through the door into the open air.');
      engine.setLocation('outside');
    } else {
      await engine.say('You turn around and head back.');
      engine.setLocation('room');
    }
  },
};

export default explore;
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `vylos dev [dir]` | Start Vite dev server |
| `vylos build [dir]` | Build single-file HTML for production |
| `vylos verify [dir]` | Type-check the project |
| `vylos create <name>` | Scaffold a new project |
| `vylos editor [dir]` | Open the visual editor |

## Monorepo Layout

```
packages/core/     @vylos/core — engine, types, stores, components, managers
packages/cli/      @vylos/cli — Vite dev/build/create commands
projects/1-basic/  Feature showcase (locations, day/night, sleep cycle)
projects/2-romance/ Dating sim (Maya/Lena routes, i18n en/fr)
projects/3-phone/  Phone game with plugin UI override
```

## Contributing

```bash
git clone https://github.com/DevOpsBenjamin/vylos.git
cd vylos
pnpm install
pnpm test
pnpm dev        # Runs the 2-romance demo project
```

## License

[MIT](LICENSE)
