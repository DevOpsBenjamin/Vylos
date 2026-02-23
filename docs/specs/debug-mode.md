# Debug Mode Spec

## Overview

A development-only debug system for Vylos that surfaces errors, provides state inspection, and enables rapid iteration. Activated automatically in dev mode (`import.meta.env.DEV`), disabled in production builds.

## Goals

- Surface TypeScript and runtime errors inline (not just console)
- Provide real-time state inspection without browser devtools
- Enable state manipulation for testing branches
- Show event flow and checkpoint history
- Zero overhead in production builds

## Components

### 1. Dev Overlay

A toggleable overlay panel (z-60, above all game UI) with tabs:

| Tab | Content |
|-----|---------|
| **State** | Live JSON view of `engineState` + `gameState`, editable |
| **Events** | List of all events with status (NotReady/Unlocked/Running/Locked), click to force-unlock |
| **History** | Checkpoint timeline — each step with type, dialogue text, choice result |
| **Console** | Filtered log output from `logger` (debug/info/warn/error levels) |

**Toggle:** `Ctrl+D` or `F12` in dev mode.

### 2. Error Dialog

When an error occurs during event execution in dev mode:

```ts
if (import.meta.env.DEV) {
  // Show inline error dialog instead of silent console.error
  showDebugError({
    title: 'Event Execution Error',
    message: error.message,
    stack: error.stack,
    eventId: currentEvent.id,
    actions: [
      { label: 'Skip Event', action: () => skipCurrentEvent() },
      { label: 'Retry', action: () => retryCurrentEvent() },
      { label: 'Ignore', action: () => {} },
    ],
  });
}
```

Features:
- Shows error message + stack trace
- Identifies the event that caused the error
- Offers Skip / Retry / Ignore buttons
- Can suppress future errors of the same type

### 3. TypeScript Error Surfacing

In dev mode, the `vylos dev` server should:
- Run `vue-tsc` in watch mode alongside Vite
- Pipe type errors to the browser via WebSocket (Vite HMR channel)
- Display type errors in the Dev Overlay console tab
- Show a toast notification when new type errors appear

### 4. State Inspector

Live reactive view of both stores:

```ts
// Accessible from Dev Overlay or via console
window.__VYLOS_DEBUG__ = {
  engineState: useEngineStateStore(),
  gameState: useGameStateStore(),
  engine: injectedEngine,
};
```

Features:
- Collapse/expand nested objects
- Edit values inline (strings, numbers, booleans)
- JSON import/export for full state snapshots
- Diff view: compare current state vs last checkpoint

### 5. Event Flow Visualization

Shows the engine loop state:

```
[Tick] → [Evaluate] → [Event: intro (Running)] → [Step 3/5: say] → [Waiting for input]
```

- Current phase indicator
- Active event ID and step count
- Navigation action log (Continue/Back/Location/Action)
- Drawable events visible at current location

## Configuration

```ts
// In engine config or vylos.config.ts
debug?: {
  enabled?: boolean;          // Override auto-detection (default: import.meta.env.DEV)
  overlay?: boolean;          // Show dev overlay (default: true in dev)
  errorDialogs?: boolean;     // Show error dialogs (default: true in dev)
  consoleExpose?: boolean;    // Expose window.__VYLOS_DEBUG__ (default: true in dev)
  typeCheck?: boolean;        // Run vue-tsc in watch mode (default: false — opt-in)
};
```

## Implementation Notes

- Dev overlay is a Vue component conditionally rendered in `GameShell.vue`
- Use `v-if="import.meta.env.DEV"` for tree-shaking in production
- State inspector uses Vue's `reactive()` — changes reflect immediately
- Error dialog uses DOM insertion (not Vue) to avoid breaking reactivity during errors
- Console tab captures `logger` output by registering a custom log handler
- TypeScript error surfacing requires Vite plugin middleware (optional, behind flag)

## Open Questions

- Should the dev overlay persist its panel state across HMR reloads?
- Should there be a "time travel" feature to step back through checkpoints?
- Should debug mode support recording + replaying full sessions for bug reports?
