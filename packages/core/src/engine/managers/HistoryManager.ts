import type { Checkpoint } from '../types';
import { logger } from '../utils/logger';

export interface HistoryEntry {
  eventId: string;
  checkpoints: Checkpoint[];
}

/**
 * Manages navigation history: back/forward through past events and checkpoints.
 * Each completed event is pushed as a HistoryEntry.
 */
export class HistoryManager {
  private history: HistoryEntry[] = [];
  private currentIndex = -1;

  /** Total history entries */
  get count(): number {
    return this.history.length;
  }

  /** Current navigation index */
  get index(): number {
    return this.currentIndex;
  }

  /** Whether back navigation is possible */
  get canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  /** Whether forward navigation is possible */
  get canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /** Current history entry */
  get current(): HistoryEntry | undefined {
    return this.history[this.currentIndex];
  }

  /** Push a completed event to history */
  push(eventId: string, checkpoints: Checkpoint[]): void {
    // Trim forward history if we branched
    if (this.currentIndex < this.history.length - 1) {
      this.history.length = this.currentIndex + 1;
    }

    this.history.push({ eventId, checkpoints });
    this.currentIndex = this.history.length - 1;
    logger.debug(`History: pushed ${eventId}, total ${this.history.length}`);
  }

  /** Go back one entry. Returns the entry to restore, or undefined. */
  goBack(): HistoryEntry | undefined {
    if (!this.canGoBack) return undefined;
    this.currentIndex--;
    return this.history[this.currentIndex];
  }

  /** Go forward one entry. Returns the entry to restore, or undefined. */
  goForward(): HistoryEntry | undefined {
    if (!this.canGoForward) return undefined;
    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  /** Clear all history */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /** Get all history for save data */
  getAll(): HistoryEntry[] {
    return structuredClone(this.history);
  }

  /** Restore history from save data */
  restore(entries: HistoryEntry[], index: number): void {
    this.history = structuredClone(entries);
    this.currentIndex = Math.min(index, this.history.length - 1);
  }
}
