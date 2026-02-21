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
  foreground: string | null;
  dialogue: DialogueState | null;
  choices: ChoiceState | null;
  currentLocationId: string | null;
  availableActions: ActionEntry[];
  availableLocations: LocationEntry[];
  menuOpen: MenuType | null;
  skipMode: boolean;
  autoMode: boolean;
}

export interface DialogueState {
  text: string;
  speaker: string | null;
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
