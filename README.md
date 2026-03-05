# Vylos

**The Sandbox Visual Novel Engine**

[![npm](https://img.shields.io/npm/v/@vylos/core)](https://www.npmjs.com/package/@vylos/core)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Vylos is a TypeScript visual novel engine for developers who want more than dialogue trees. Build sandbox VNs with explorable locations, timed actions, stat tracking, and full plugin customization — all with checkpoint-based execution inspired by Ren'Py.

## Why Vylos

- **Sandbox-first** — Locations, actions, time systems, stats, and inventory out of the box. Your game is a world, not a script.
- **TypeScript safety** — Typed events, typed game state, full autocomplete. No more mistyped variable names breaking your game at runtime.
- **Plugin everything** — Swap any UI component, override any engine manager, inject custom stores. The engine adapts to your game, not the other way around.

## Vylos vs the Alternatives

| | Vylos | Ren'Py | SugarCube |
|---|---|---|---|
| **Language** | TypeScript | Python (custom DSL) | JavaScript (Twine macros) |
| **Execution** | Checkpoint async/await | Checkpoint script | Passage-based |
| **Type safety** | Full (compile-time) | None | None |
| **UI customization** | Vue components + DI | Screen language | CSS + macros |
| **Distribution** | Single HTML file | Desktop/mobile app | HTML file |
| **State model** | Typed Pinia stores | Python variables | Story variables |

## Getting Started

```bash
pnpm add -D @vylos/cli
npx vylos create my-game
cd my-game && pnpm dev
```

Requires Node.js >= 22.0.0 and pnpm 9.15+.

## Sample Projects

| Demo | Description |
|---|---|
| **1-basic** | Minimal playable demo — 3 locations, day/night cycle, 1 NPC, custom game state |
| **2-advanced** | Full showcase — 5 locations, 2 NPC routes, i18n, custom TopBar, journal overlay, DI-registered items, typed helpers |
| **3-phone** | Phone UI — demonstrates component overrides (GameShell, TopBar, DialogueBox) |

## How It Works

Events are async functions that pause at each `say()` or `choice()`:

```typescript
import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';

const firstVisit: VylosEvent = {
  id: 'first_visit',
  locationId: 'cafe',
  conditions: (state) => state.flags['woke_up'] && !state.flags['visited_cafe'],

  async execute(engine: VylosEventAPI, state: VylosGameState) {
    await engine.say('The cafe is warm and inviting.');

    engine.setForeground('/assets/locations/cafe/maya.png');
    await engine.say('"New face! I\'m Maya."', { from: maya });

    const pick = await engine.choice([
      { text: 'Flirt', value: 'flirt' },
      { text: 'Be friendly', value: 'friendly' },
    ]);

    if (pick === 'flirt') {
      modAffection(state, 'maya', 15);
    }

    state.flags['visited_cafe'] = true;
  },
};
```

Rollback works by re-executing the event and fast-forwarding past checkpoints — no manual state snapshots needed.

## Project Structure

```
my-game/
├── vylos.config.ts          # Name, id, languages, resolution
├── setup.ts                 # VylosPlugin: setup(), components, gameStore
├── main.ts                  # Bootstrap
├── plugins/my-game/
│   ├── gameDatas/            # Modular state (player, relationships, journal)
│   ├── helpers/              # Typed wrappers (modAffection, formatTime)
│   ├── components/           # Custom Vue components (TopBar, overlays)
│   └── data/                 # Items, recipes, constants
├── locations/<id>/
│   ├── location.ts           # Backgrounds, name, accessibility
│   ├── events/               # Location-scoped events
│   └── actions/              # Location-scoped actions
├── global/
│   ├── events/               # Global events (trigger anywhere)
│   └── actions/              # Global actions
└── assets/                   # Images, audio
```

## Key Concepts

- **Events** — Async functions that pause at `say()` and `choice()`. Gated by `conditions` and `locked`.
- **Locations** — Places the player can visit. Backgrounds change by time of day. Navigation via linked location graph.
- **Actions** — Buttons that modify state (rest, order coffee). Use flag-to-event pattern for narrated actions.
- **State** — Extend `VylosGameState` with custom fields. Compose from sub-modules (player, relationships, journal).
- **Plugins** — `VylosPlugin` with three hooks: `setup(container)` for DI, `components` for UI overrides, `gameStore` for custom state.

## CLI Commands

| Command | Description |
|---|---|
| `vylos dev` | Start Vite dev server |
| `vylos build` | Build single-file HTML |
| `vylos create <name>` | Scaffold a new project |
| `vylos verify` | Type-check the project |
| `vylos editor` | Open the visual editor |

## Contributing

```bash
git clone https://github.com/DevOpsBenjamin/vylos.git
cd vylos && pnpm install
pnpm test
pnpm dev              # Runs GitHub Pages showcase
```

## Monorepo Layout

```
packages/core/       @vylos/core — engine, stores, components, managers
packages/cli/        @vylos/cli — dev/build/create commands
projects/1-basic/    Minimal demo
projects/2-advanced/ Full plugin showcase
projects/3-phone/    Phone UI override demo
pages/               GitHub Pages site
```

## License

[MIT](LICENSE)
