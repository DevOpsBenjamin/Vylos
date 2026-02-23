# NPC System Spec

## Overview

A type hierarchy for NPCs with relationship tracking, stat management, and daily interaction limits. Base NPC lives in `@vylos/core`; project-specific extensions (DateableNPC, etc.) live in project code.

## Type Hierarchy

### Base NPC (Core)

Minimal NPC type in `@vylos/core`:

```ts
interface NPC {
  name: string;
  flags: Record<string, boolean>;
}
```

Stored in `gameState.npcs` as `Record<string, NPC>`.

### DateableNPC (Project Extension)

Extended NPC type for dating sim projects:

```ts
interface DateableNPC extends NPC {
  relation: number;              // 0-100 affection points
  relationship: RelationLevel;   // Computed from relation points
  daily: Record<string, boolean>; // Per-day interaction tracking (reset each day)
}

enum RelationLevel {
  Stranger = 'stranger',         // 0-9
  Acquaintance = 'acquaintance', // 10-29
  Friend = 'friend',             // 30-59
  CloseFriend = 'close_friend',  // 60-100
}
```

## Managers

### RelationManager

Static utility class for relationship operations:

```ts
class RelationManager {
  /** Add affection points (clamped to 0-100) */
  static addRelation(npc: DateableNPC, amount: number): void;

  /** Remove affection points (clamped to min, default 0) */
  static removeRelation(npc: DateableNPC, amount: number, min?: number): void;

  /** Recalculate relationship level from current points */
  static updateRelationshipLevel(npc: DateableNPC): void;

  /** Get current relation status for UI display */
  static getRelationStatus(npc: DateableNPC): {
    level: RelationLevel;
    points: number;
    nextThreshold: number | null;
  };

  /** Track daily interaction — returns false if already interacted today */
  static interactDaily(npc: DateableNPC): boolean;
}
```

**Thresholds:**
| Level | Min Points |
|-------|-----------|
| Stranger | 0 |
| Acquaintance | 10 |
| Friend | 30 |
| Close Friend | 60 |

### StatManager

Static utility class for player stat operations:

```ts
class StatManager {
  static addEnergy(state: BaseGameState, amount: number, max?: number): void;
  static removeEnergy(state: BaseGameState, amount: number): boolean;
  static hasEnergy(state: BaseGameState, required: number): boolean;
  static canPerformActivity(state: BaseGameState, energyCost: number): boolean;
  static performActivity(state: BaseGameState, energyCost: number, lustGain?: number): boolean;
  static restoreStats(state: BaseGameState, energy?: number, lust?: number): void;
}
```

## Daily Tracking

- `npc.daily` stores boolean flags keyed by interaction type (e.g., `'interacted'`, `'gifted'`)
- Reset at day boundary (when `state.day` increments)
- `interactDaily()` checks `npc.daily.interacted`, sets it true, awards 1-3 random relation points
- Prevents double-rewarding from repeated conversations

## Integration Pattern

### In Event Conditions

```ts
conditions(state) {
  return state.npcs.maya.relationship === RelationLevel.Friend
    && state.npcs.maya.flags['poem_read'] === true;
}
```

### In Event Execute

```ts
async execute(engine, state) {
  RelationManager.addRelation(state.npcs.maya, 5);
  StatManager.performActivity(state, 15); // costs 15 energy

  await engine.say("Maya smiles warmly at you.");
}
```

### NPC Creator Pattern

Factory functions for initializing NPC state:

```ts
function createDateableNPC(name: string): DateableNPC {
  return {
    name,
    flags: {},
    relation: 0,
    relationship: RelationLevel.Stranger,
    daily: {},
  };
}
```

Used in `startGame()` when initializing gameState.

## UI Components

### NPC Info Panel

Displays NPC relationship status:
- Name and current relationship level
- Progress bar (0-100 relation points)
- Next threshold indicator
- Recent interaction history from flags

## Implementation Notes

- Base `NPC` interface exported from `@vylos/core` types
- `DateableNPC`, `RelationManager`, `StatManager` are project-level code (not in core)
- Projects can create their own NPC subtypes (e.g., `ShopkeeperNPC` with inventory)
- Managers are static classes (no DI) for simplicity
- Save/load: NPC state is part of `gameState`, serialized automatically
- Day reset logic belongs in the project's time advancement action
