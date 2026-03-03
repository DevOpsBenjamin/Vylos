# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vylos is a visual novel engine built as a distributable pnpm monorepo. It uses a checkpoint-based execution model (like Ren'Py — inline choices with `if/else`, rollback via re-execute + fast-forward). End users install `@vylos/core` and write visual novels in their own project.

## Development Commands

```bash
pnpm install                    # Install all workspace deps
pnpm test                       # Run Vitest (packages/core)
pnpm dev:basic                  # Dev server: 1-basic
pnpm dev:advanced               # Dev server: 2-advanced
pnpm dev:phone                  # Dev server: 3-phone
pnpm dev                        # Shortcut → GitHub Pages showcase
pnpm dev:pages                  # Dev server: GitHub Pages showcase
pnpm build:basic                # Production single-HTML build
pnpm build:advanced             # Production single-HTML build
pnpm build:phone                # Production single-HTML build
pnpm build:pages                # Build GitHub Pages showcase
pnpm build:all                  # Build pages + all projects
npx vylos create <name>         # Scaffold a new Vylos project
```

Node.js >= 22.0.0, pnpm 9.15+ required.

## Monorepo Structure

```
packages/core/         @vylos/core (0.3.0) — engine, types, schemas, stores, components, managers
packages/cli/          @vylos/cli (0.3.0) — Vite dev/build/create commands + project templates
projects/1-basic/      Minimal demo (3 locations, day/night, 1 NPC, custom gameStore)
projects/2-advanced/   Advanced demo (5 locations, Maya/Lena, i18n, plugin showcase: custom TopBar, journal, DI items, typed helpers)
projects/3-phone/      Phone game with plugin UI override
pages/                 GitHub Pages showcase site
```

## Architecture

### Engine Execution (checkpoint-based)

Each `await engine.say()` / `engine.choice()` **pauses** the event function via native async/await. The `WaitManager` creates a promise that the UI resolves when the player interacts (click, keyboard). Rollback replays the event, fast-forwarding past seen steps.

### Game Loop

```
Engine.run(events, getState, loopCallbacks)
  → loop:
    → loopCallbacks.onTick(state)           # Update UI: locations, actions, background
    → EventManager.evaluate(state)           # Check conditions + locationId filter
    → EventManager.getNextUnlocked(state)    # First unlocked event at current location
    → EventRunner.executeEvent()             # async — pauses at each say/choice
    → event completes → lock → push to HistoryManager
    → NavigationManager.waitForNavigation()  # Pauses for player input
    → handle navigation (continue/location/action/back/forward)
    → loopCallbacks.onAction(id, state)      # Execute action via ActionManager
    → loop
```

### EngineLoopCallbacks (main.ts → Engine bridge)

Projects wire `LocationManager`, `ActionManager`, and the engine store together via callbacks passed to `engine.run()`:

```typescript
engine.run(events, () => gameState.state, {
  onTick(state) {
    // Update available locations + actions in engineState store
    // Resolve background based on locationId + gameTime
  },
  onAction(actionId, state) {
    actionManager.execute(actionId, state);
  },
});
```

### Engine Creation (callbacks-based)

`createEngine({ callbacks, projectId })` takes an `EventRunnerCallbacks` object that wires the engine to stores and managers. Projects define callbacks for `onSay`, `onChoice`, `onSetBackground`, `onSetForeground`, `onSetLocation`, `onClear`, `resolveText`, `getState`, `setState`. DI via tsyringe is available — projects can provide a `VylosPlugin` with `setup(container)` to override managers.

### State (Pinia)

- **engineState** — UI: phase, background, foreground, dialogue, choices, menus, overlay, availableLocations, availableActions
- **gameState** — Game: locationId, gameTime, flags, counters, player

### Menu System

- **MainMenu** — Shown on `EnginePhase.MainMenu`. Buttons: New Game, Continue (only if game running), Load, Settings
- **PauseMenu** — Opened on Escape during gameplay (`MenuType.PauseMenu`). Buttons: Continue, Save, Load, Settings, Main Menu
- **SaveLoadMenu** / **SettingsMenu** — Opened from PauseMenu or MainMenu

### Event Location Filtering

Events with `locationId` only trigger when the player is at that location. `EventManager.evaluate()` and `getNextUnlocked(state)` both filter by `state.locationId`. Global events (no `locationId`) trigger anywhere.

### Action → Event Pattern

For actions that need narration (e.g., Sleep), use the flag pattern:
1. **Action** sets a flag: `state.flags['try_sleep'] = true`
2. **Event** triggers on that flag, runs narration, then resets the flag

## Critical Rules

### NO PROPS — Use inject / stores / classes

**Props and event emitting are strongly discouraged.** Vue components should access data and trigger actions through:
- `inject(ENGINE_INJECT_KEY)` to get the Engine instance
- Pinia stores (`useEngineStateStore()`, `useGameStateStore()`) for reactive UI state
- Direct method calls on engine managers (`engine.eventRunner.resolveWait()`, `engine.navigationManager.selectLocation()`)

### No SVG Icons

Use emojis or Unicode symbols. Never SVG paths in components.

### cqw/cqh Units

All dynamic sizes (font-size, padding, margins, gaps) must use container query units (`cqw`, `cqh`). Parent needs `container-type: size`. No px/rem for UI that scales with the viewport.

### File Size Limit

Keep files under 200-300 lines. Single-responsibility managers. Engine.ts orchestrates, doesn't implement.

### Tailwind v4 in Monorepo

Each project's `style.css` must have `@source` directives pointing to core components:
```css
@import "tailwindcss";
@source "../../packages/core/src/components";
```

### structuredClone + Vue Reactivity

Never `structuredClone()` a Vue `reactive()` proxy directly — use `toRaw()` first. Vue proxies are not cloneable.

## Key Patterns

- **WaitManager**: promise-based pause/resume. `wait()` creates promise, `resolve(value)` unblocks it
- **JumpSignal**: thrown by `engine.jump()`, caught by Engine to transfer to target event
- **EventEndError**: thrown by `engine.end()` for clean termination
- **NavigationManager.cancel()**: resolves with Continue (not null) to unblock engine loop
- **TextEntry**: `string | Record<string, string>` for i18n. Resolved by `LanguageManager` or callbacks

## Component Hierarchy

```
GameShell (keyboard handler via InputManager, phase routing)
├── LoadingScreen
├── MainMenu (New Game, Continue, Load, Settings)
├── EngineView
│   ├── BackgroundLayer (z-0)
│   ├── ForegroundLayer (z-10)
│   ├── LocationOverlay (z-20, bottom-right circles, blue hover, hidden during dialogue)
│   ├── ActionOverlay (z-20, bottom-left circles, green hover, hidden during dialogue)
│   ├── TopBar (z-25, centered: location pin + game time)
│   ├── DialogueBox (z-30, cqw-sized text)
│   ├── ChoicePanel (z-35)
│   └── CustomOverlay (z-40)
├── PauseMenu (z-50, Escape key)
├── SaveLoadMenu (z-50)
└── SettingsMenu (z-50)
```

## Project Structure (for game authors)

Assets are flat — separated from code in a top-level `assets/` directory. Background paths in `location.ts` use `/assets/locations/<id>/...` (resolved via `assetUrl()`).

```
projects/<name>/
├── index.html          # Vite entry
├── main.ts             # Bootstrap: createApp, createEngine, callbacks, managers, provide, run
├── style.css           # Tailwind + @source
├── vylos.config.ts     # Project metadata (id, name, version, languages, resolution)
├── setup.ts            # VylosPlugin (optional)
├── assets/
│   ├── global/
│   │   └── menu/       # Menu background (titleimage, etc.)
│   └── locations/<id>/ # Background images per location (time-of-day variants)
├── locations/<id>/
│   ├── location.ts     # VylosLocation: id, name, backgrounds (path + timeRange)
│   ├── events/         # VylosEvent files (locationId, conditions, execute)
│   └── actions/        # VylosAction files (locationId, unlocked, execute)
└── global/
    ├── events/         # Global events (no locationId, trigger anywhere)
    └── actions/        # Global actions (no locationId, always available)
```
