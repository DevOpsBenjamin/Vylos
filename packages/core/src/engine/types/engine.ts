import type { DrawableEventEntry } from './events';
import type { VylosCharacter } from './dialogue';

/** A single foreground layer (character sprite, object, etc.) */
export interface ForegroundLayer {
  /** Asset path */
  path: string;
  /** Horizontal offset as percentage of viewport (0 = center), rendered as cqw */
  x?: number;
  /** Vertical offset as percentage of viewport (0 = center), rendered as cqh */
  y?: number;
  /** Scale multiplier (default 1) */
  scale?: number;
  /** Anchor point for positioning */
  anchor?: 'center' | 'bottom-center';
}

/** Input accepted by engine.setForeground() — backward compatible */
export type ForegroundInput = string | ForegroundLayer | ForegroundLayer[] | null;

/** Normalize any ForegroundInput to the canonical array form (or null) */
export function normalizeForeground(input: ForegroundInput): ForegroundLayer[] | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'string') return [{ path: input }];
  if (Array.isArray(input)) return input.length === 0 ? null : input;
  return [input];
}

/** Engine lifecycle phases */
export enum EnginePhase {
  /** Engine created but not initialized */
  Created = 'created',
  /** Loading project data */
  Loading = 'loading',
  /** Main menu displayed */
  MainMenu = 'main_menu',
  /** Game running */
  Running = 'running',
  /** Game paused (save/load/settings menu) */
  Paused = 'paused',
}

/** Engine UI state (managed by Pinia, drives Vue rendering) */
export interface EngineState {
  phase: EnginePhase;
  background: string | null;
  foreground: ForegroundLayer[] | null;
  dialogue: DialogueState | null;
  choices: ChoiceState | null;
  currentLocationId: string | null;
  availableActions: ActionEntry[];
  availableLocations: LocationEntry[];
  drawableEvents: DrawableEventEntry[];
  menuOpen: MenuType | null;
  skipMode: boolean;
  autoMode: boolean;
}

export interface DialogueState {
  text: string;
  speaker: VylosCharacter | null;
  isNarration: boolean;
}

export interface ChoiceState {
  prompt: string | null;
  options: ChoiceOption[];
  /** Checkpoint step index (present when displaying a history choice for redo) */
  historyStepIndex?: number;
  /** Previously chosen value (for highlighting in redo mode) */
  historySelectedValue?: string;
}

export interface ChoiceOption {
  text: string;
  value: string;
  disabled?: boolean;
}

export interface ActionEntry {
  id: string;
  label: string;
  locationId: string;
}

export interface LocationEntry {
  id: string;
  name: string;
  accessible: boolean;
}

export enum MenuType {
  PauseMenu = 'pause_menu',
  Save = 'save',
  Load = 'load',
  Settings = 'settings',
}

/** Engine settings (persisted separately) */
export interface EngineSettings {
  textSpeed: number;
  autoSpeed: number;
  volume: {
    master: number;
    music: number;
    sfx: number;
    voice: number;
  };
  language: string;
  fullscreen: boolean;
}
