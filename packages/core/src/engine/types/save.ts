import type { VylosGameState } from './game-state';
import type { Checkpoint } from './checkpoint';

/** A single save slot */
export interface SaveSlot {
  /** Slot number */
  slot: number;
  /** When this save was created */
  timestamp: number;
  /** Save format version for migration */
  version: number;
  /** Game state snapshot */
  gameState: VylosGameState;
  /** Current event ID (if mid-event) */
  eventId: string | null;
  /** Checkpoint step number (if mid-event) */
  stepNumber: number;
  /** Player-visible label */
  label: string;
  /** Screenshot thumbnail (data URL) */
  thumbnail: string | null;
  /** Checkpoints for mid-event resume */
  checkpoints?: Checkpoint[];
  /** Game state before event started (for redo support after load) */
  initialState?: VylosGameState;
  /** Completed event history */
  history?: Array<{ eventId: string; checkpoints: Checkpoint[] }>;
  /** Current history navigation index */
  historyIndex?: number;
  /** IDs of events that were locked (completed) at save time */
  lockedEventIds?: string[];
}

/** Save metadata (displayed in save/load menu without loading full state) */
export interface SaveMeta {
  slot: number;
  timestamp: number;
  label: string;
  thumbnail: string | null;
}
