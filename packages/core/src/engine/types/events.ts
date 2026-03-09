import type { VylosGameState } from './game-state';
import type { VylosCharacter } from './dialogue';
import type { ForegroundInput } from './engine';

/** A text entry with per-language strings */
export type TextEntry = Record<string, string>;

/** Options for engine.say() */
export interface SayOptions {
  from?: VylosCharacter;
  variables?: Record<string, string | number>;
}

/** Options for engine.choice() */
export interface ChoiceItem<T extends string = string> {
  text: string | TextEntry;
  value: T;
  disabled?: boolean;
  condition?: () => boolean;
}

/** Inventory operations available to event authors via engine.inventory */
export interface InventoryAPI {
  add(bag: string, itemId: string, qty?: number): number;
  remove(bag: string, itemId: string, qty?: number): number;
  has(bag: string, itemId: string, qty?: number): boolean;
  hasAll(bag: string, items: Record<string, number>): boolean;
  count(bag: string, itemId: string): number;
  list(bag: string): Array<[string, number]>;
  clear(bag: string): void;
}

/**
 * Minimal sync API available to action execute() functions.
 * Actions can jump to events and manage inventory.
 */
export interface VylosActionAPI {
  /** Jump to an event (throws JumpSignal) */
  jump(eventId: string): never;

  /** Inventory operations (add, remove, has, count, etc.) */
  readonly inventory: InventoryAPI;
}

/**
 * Full API available to event execute() functions.
 * This is what visual novel authors interact with.
 */
export interface VylosEventAPI extends VylosActionAPI {
  /** Show dialogue text and wait for player to continue */
  say(text: string | TextEntry, options?: SayOptions): Promise<void>;

  /** Show choices and return the selected value */
  choice<T extends string>(items: ChoiceItem<T>[]): Promise<T>;

  /** Set the background image */
  setBackground(path: string): void;

  /** Show/hide foreground layers (character sprites, etc.) */
  setForeground(input: ForegroundInput): void;

  /** End the current event */
  end(): never;

  /** Wait for a specified duration (ms) */
  wait(ms: number): Promise<void>;

  /** Change location */
  setLocation(locationId: string): void;
}


/** Configuration for drawable events — clickable characters/objects in a location */
export interface DrawableEventConfig {
  /** Display text for the clickable element */
  label: string | TextEntry;
  /** Placement hint on screen */
  position?: 'left' | 'center' | 'right';
  /** Emoji/unicode icon */
  icon?: string;
}

/** A drawable event entry for UI rendering */
export interface DrawableEventEntry {
  id: string;
  label: string | TextEntry;
  position: 'left' | 'center' | 'right';
  icon?: string;
}

/** A visual novel event definition */
export interface VylosEvent<TState extends VylosGameState = VylosGameState> {
  /** Unique event ID (derived from file path if not specified) */
  id: string;

  /** Location this event belongs to (null for global events) */
  locationId?: string;

  /** Make this event drawable — a clickable element the player interacts with instead of auto-triggering */
  draw?: DrawableEventConfig;

  /** Whether this event should trigger — checked each game loop tick */
  conditions?(state: TState): boolean;

  /** Gate from NotReady → Ready. Return false to stay NotReady, anything else = Ready. */
  unlocked?(state: TState): boolean;

  /** Called after execution. Return true to permanently lock, anything else = stays Ready. */
  locked?(state: TState): boolean;

  /** The event's narrative logic */
  execute(engine: VylosEventAPI, state: TState): Promise<void>;
}

/** Event lifecycle status */
export enum EventStatus {
  /** unlocked() gate not yet passed */
  NotReady = 'not_ready',
  /** Ready to execute when conditions met */
  Ready = 'ready',
  /** Currently executing */
  Running = 'running',
  /** Permanently locked (locked() returned true) */
  Locked = 'locked',
}
