import type { BaseGameState } from './game-state';
import type { Character } from './dialogue';

/** A text entry with per-language strings */
export type TextEntry = Record<string, string>;

/** Options for engine.say() */
export interface SayOptions {
  from?: Character;
  variables?: Record<string, string | number>;
}

/** Options for engine.choice() */
export interface ChoiceItem<T extends string = string> {
  text: string | TextEntry;
  value: T;
  disabled?: boolean;
  condition?: () => boolean;
}

/**
 * The API available to event execute() functions.
 * This is what visual novel authors interact with.
 */
export interface VylosAPI {
  /** Show dialogue text and wait for player to continue */
  say(text: string | TextEntry, options?: SayOptions): Promise<void>;

  /** Show choices and return the selected value */
  choice<T extends string>(items: ChoiceItem<T>[]): Promise<T>;

  /** Set the background image */
  setBackground(path: string): void;

  /** Show/hide a foreground image (character sprite, etc.) */
  setForeground(path: string | null): void;

  /** Show a custom overlay component */
  showOverlay(componentId: string, props?: Record<string, unknown>): Promise<void>;

  /** Hide overlay */
  hideOverlay(): void;

  /** Jump to another event */
  jump(eventId: string): never;

  /** End the current event */
  end(): never;

  /** Wait for a specified duration (ms) */
  wait(ms: number): Promise<void>;

  /** Change location */
  setLocation(locationId: string): void;

  /** Play sound effect */
  playSfx(path: string): void;

  /** Play background music */
  playMusic(path: string): void;

  /** Stop background music */
  stopMusic(): void;
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
  label: string;
  position: 'left' | 'center' | 'right';
  icon?: string;
}

/** A visual novel event definition */
export interface VylosEvent<TState extends BaseGameState = BaseGameState> {
  /** Unique event ID (derived from file path if not specified) */
  id: string;

  /** Location this event belongs to (null for global events) */
  locationId?: string;

  /** Make this event drawable — a clickable element the player interacts with instead of auto-triggering */
  draw?: DrawableEventConfig;

  /** Whether this event should trigger — checked each game loop tick */
  conditions?(state: TState): boolean;

  /** Called when event transitions from NotReady → Unlocked */
  unlocked?(state: TState): void;

  /** Called when event completes (Unlocked → Locked) */
  locked?(state: TState): void;

  /** The event's narrative logic */
  execute(engine: VylosAPI, state: TState): Promise<void>;
}

/** Event lifecycle status */
export enum EventStatus {
  /** Conditions not yet met */
  NotReady = 'not_ready',
  /** Conditions met, ready to execute */
  Unlocked = 'unlocked',
  /** Currently executing */
  Running = 'running',
  /** Completed */
  Locked = 'locked',
}
