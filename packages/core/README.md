# @vylos/core

The engine, types, stores, and components for [Vylos](https://github.com/DevOpsBenjamin/Vylos) — a checkpoint-based visual novel engine built with Vue 3 and TypeScript.

[![npm](https://img.shields.io/npm/v/@vylos/core)](https://www.npmjs.com/package/@vylos/core)

## Features

- **Checkpoint-based execution** — `engine.say()` and `engine.choice()` pause via async/await, rollback via re-execute + fast-forward (like Ren'Py)
- **Rollback & history** — full forward/back navigation through past dialogue
- **Save/load with mid-event resume** — checkpoint system preserves exact position
- **Inventory system** — bag-based `engine.inventory.add/remove/has/count/list/clear`
- **Location & action managers** — time-of-day backgrounds, linked locations, conditional actions
- **Drawable events** — clickable characters/objects on screen
- **i18n** — `string | Record<string, string>` for multi-language support
- **Plugin system** — DI-based (tsyringe) manager and component overrides
- **Dev console** — `window.Vylos` for debugging and cheating (state, inventory, engine)
- **H key** — hide all UI to view artwork (Ren'Py style)
- **AZERTY/QWERTY auto-detect** — keyboard input adapts automatically

## Install

```bash
pnpm add @vylos/core
```

Requires Vue 3 and Pinia.

## Usage

```typescript
import {
  createEngine,
  GameShell,
  useEngineStateStore,
  ENGINE_INJECT_KEY,
  type VylosEvent,
  type VylosEventAPI,
  type VylosGameState,
} from '@vylos/core';
```

### Writing events

```typescript
const intro: VylosEvent = {
  id: 'intro',
  conditions: (state) => !state.flags['intro_done'],
  async execute(engine: VylosEventAPI, state: VylosGameState) {
    await engine.say('Welcome!');

    const pick = await engine.choice([
      { text: 'Start', value: 'start' },
      { text: 'Learn more', value: 'more' },
    ]);

    if (pick === 'more') {
      await engine.say('Events pause at each say() and choice().');
    }

    state.flags['intro_done'] = true;
  },
};
```

### Extending types

```typescript
import type { VylosCharacter, VylosGameState } from '@vylos/core';

interface Character extends VylosCharacter {
  portrait?: string;
}

interface GameState extends VylosGameState {
  player: Character;
  energy: number;
}
```

### Inventory

```typescript
async execute(engine: VylosEventAPI, state: GameState) {
  engine.inventory.add('backpack', 'potion', 3);

  if (engine.inventory.has('backpack', 'key')) {
    engine.inventory.remove('backpack', 'key', 1);
    await engine.say('You used the key.');
  }
}
```

## Key bindings

| Key | Action |
|-----|--------|
| Space / Enter / E | Advance dialogue |
| D / Arrow Right | Forward |
| A / Q / Arrow Left | Back |
| H | Toggle UI visibility |
| S | Toggle skip mode |
| Escape | Pause menu |

## Documentation

Full docs and examples: [github.com/DevOpsBenjamin/Vylos](https://github.com/DevOpsBenjamin/Vylos)

## License

[MIT](https://github.com/DevOpsBenjamin/Vylos/blob/main/LICENSE)
