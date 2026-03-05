# Custom Actions / Mini-Game System Spec

## Overview

Enables game authors to create interactive mini-games (lockpicking, card games, puzzles) that integrate with the event system. Uses a registry pattern for handler registration and a dual-phase execution model (simulate + playback) for save/load safety.

## Core Concepts

### CustomRegistry

Central registry mapping action IDs to handler functions:

```ts
type CustomHandler = {
  /** Optional: preview/simulate without UI */
  simulate?: (args: unknown, state: BaseGameState) => { preview?: unknown };
  /** Execute with UI overlay — resolve a branch or reject */
  execute: (ctx: CustomExecutionContext) => void | (() => void);
};

class CustomRegistry {
  static register(id: string, handler: CustomHandler): void;
  static get(id: string): CustomHandler | undefined;
  static has(id: string): boolean;
  static list(): string[];
  static clear(): void;
}
```

### VylosEventAPI Extension

Add `runCustom()` to the engine API:

```ts
interface VylosEventAPI {
  /** Run a custom action/mini-game, returns the branch result */
  runCustom<T = string>(args: CustomArgs): Promise<T>;
}

interface CustomArgs {
  /** Handler ID registered in CustomRegistry */
  id: string;
  /** Serializable payload passed to the handler */
  args?: unknown;
  /** Deterministic seed for reproducible outcomes on replay */
  seed?: number;
}
```

### CustomExecutionContext

Passed to the handler's `execute` function:

```ts
interface CustomExecutionContext {
  args: unknown;
  state: BaseGameState;
  /** Resolve the action with a branch ID */
  resolveBranch(branchId: string): void;
  /** Reject the action (error/timeout) */
  reject(error: Error): void;
  /** Mount a Vue component as overlay */
  mountOverlay(componentId: string, props?: Record<string, unknown>): void;
  /** Unmount the overlay */
  unmountOverlay(): void;
}
```

## Execution Flow

### During Normal Play

1. Event calls `await engine.runCustom({ id: 'lockpick', args: { difficulty: 3 } })`
2. Engine creates a RUN_CUSTOM checkpoint step
3. Engine looks up handler via `CustomRegistry.get('lockpick')`
4. Handler's `execute()` receives context, mounts overlay
5. Player interacts with mini-game UI
6. Handler calls `ctx.resolveBranch('success')` or `ctx.resolveBranch('failure')`
7. Engine records result in checkpoint, unmounts overlay
8. `runCustom()` promise resolves with the branch value
9. Event continues with branching logic based on result

### During Replay (Fast-Forward)

1. Engine sees RUN_CUSTOM checkpoint with recorded result
2. Skips handler execution entirely
3. Returns the recorded branch value immediately
4. Event continues as normal

### Save/Load

- Full `CustomArgs` serialized in checkpoint
- Result branch serialized in checkpoint
- On load + replay: fast-forward uses stored result, no handler re-execution
- Deterministic seed ensures same outcome if handler runs `simulate()`

## Key Design Rules

1. **Handlers must be idempotent** — same args + seed = same simulation result
2. **No direct state mutation** — results flow through branch selection only
3. **Overlay cleanup required** — `execute()` may return a cleanup function
4. **Timeout safety** — engine should enforce a max timeout to prevent deadlocks
5. **Serializable args only** — no functions, no DOM refs in `CustomArgs`

## Usage Example

```ts
// Registration (in project setup.ts)
CustomRegistry.register('coin_flip', {
  simulate(args, state) {
    const rng = seedRandom(args.seed);
    return { preview: rng() > 0.5 ? 'heads' : 'tails' };
  },
  execute(ctx) {
    ctx.mountOverlay('CoinFlipGame', { seed: ctx.args.seed });
    // CoinFlipGame component calls ctx.resolveBranch('heads'|'tails')
  },
});

// Usage in event
const result = await engine.runCustom({ id: 'coin_flip', args: { seed: 42 } });
if (result === 'heads') {
  await engine.say("You win!");
} else {
  await engine.say("You lose!");
}
```

## Implementation Notes

- `CustomRegistry` is a static class (no DI needed, registered before engine starts)
- Overlay mounting reuses `engineState.setOverlay()` pattern
- Checkpoint step type: `'custom'` alongside existing `'say'` and `'choice'`
- Fast-forward check: if checkpoint has result, skip execute and return it
