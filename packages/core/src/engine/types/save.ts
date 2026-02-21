import type { BaseGameState } from './game-state';

/** A single save slot */
export interface SaveSlot {
  /** Slot number */
  slot: number;
  /** When this save was created */
  timestamp: number;
  /** Save format version for migration */
  version: number;
  /** Game state snapshot */
  gameState: BaseGameState;
  /** Current event ID (if mid-event) */
  eventId: string | null;
  /** Checkpoint step number (if mid-event) */
  stepNumber: number;
  /** Player-visible label */
  label: string;
  /** Screenshot thumbnail (data URL) */
  thumbnail: string | null;
}

/** Save metadata (displayed in save/load menu without loading full state) */
export interface SaveMeta {
  slot: number;
  timestamp: number;
  label: string;
  thumbnail: string | null;
}
