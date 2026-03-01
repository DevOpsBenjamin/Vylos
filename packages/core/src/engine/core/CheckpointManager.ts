import type { VylosGameState, Checkpoint, CheckpointType, ChoiceOption, ForegroundLayer } from '../types';
import type { DialogueState } from '../types/engine';
import { normalizeForeground } from '../types/engine';

export interface CaptureDisplayData {
  dialogue?: DialogueState | null;
  background?: string | null;
  foreground?: ForegroundLayer[] | null;
  choiceOptions?: ChoiceOption[];
}

/**
 * Manages checkpoints for event execution and rollback.
 * Each interaction point (say, choice, wait) creates a checkpoint
 * containing a deep clone of game state + the result of that interaction.
 */
export class CheckpointManager {
  private checkpoints: Checkpoint[] = [];
  private replayIndex = -1;

  /** Whether we're currently in replay mode (fast-forwarding during rollback) */
  get isReplaying(): boolean {
    return this.replayIndex >= 0 && this.replayIndex < this.checkpoints.length;
  }

  /** Current replay step (or -1 if not replaying) */
  get currentReplayStep(): number {
    return this.replayIndex;
  }

  /** Total number of checkpoints stored */
  get count(): number {
    return this.checkpoints.length;
  }

  /** Get checkpoint at a specific index */
  getAt(index: number): Checkpoint | undefined {
    return this.checkpoints[index];
  }

  /** Record a checkpoint at the current interaction point */
  capture(gameState: VylosGameState, type: CheckpointType, choiceResult?: string, display?: CaptureDisplayData): void {
    const checkpoint: Checkpoint = {
      step: this.checkpoints.length,
      gameState: JSON.parse(JSON.stringify(gameState)),
      type,
      choiceResult,
      dialogue: display?.dialogue ? JSON.parse(JSON.stringify(display.dialogue)) : undefined,
      background: display?.background,
      foreground: display?.foreground ? JSON.parse(JSON.stringify(display.foreground)) : display?.foreground,
      choiceOptions: display?.choiceOptions ? JSON.parse(JSON.stringify(display.choiceOptions)) : undefined,
    };

    // If replaying past the current index, trim future checkpoints
    if (this.replayIndex >= 0) {
      this.checkpoints.length = this.replayIndex;
      this.replayIndex = -1;
    }

    this.checkpoints.push(checkpoint);
  }

  /** Get the stored choice result for the current replay step (or undefined) */
  getReplayChoiceResult(): string | undefined {
    if (!this.isReplaying) return undefined;
    return this.checkpoints[this.replayIndex]?.choiceResult;
  }

  /** Advance replay index by one step. Returns false if replay is done. */
  advanceReplay(): boolean {
    if (!this.isReplaying) return false;
    this.replayIndex++;
    return this.replayIndex < this.checkpoints.length;
  }

  /** Get game state snapshot at a specific step */
  getStateAt(step: number): VylosGameState | undefined {
    const checkpoint = this.checkpoints[step];
    if (!checkpoint) return undefined;
    return structuredClone(checkpoint.gameState);
  }

  /** Get all checkpoints (for save/load) */
  getAll(): Checkpoint[] {
    return this.checkpoints.map(c => structuredClone(c));
  }

  /** Prepare for rollback: set replay index to target step */
  prepareRollback(targetStep: number): VylosGameState | undefined {
    if (targetStep < 0 || targetStep >= this.checkpoints.length) return undefined;
    this.replayIndex = 0;
    // Trim checkpoints after target (re-execution will recreate them)
    const targetState = structuredClone(this.checkpoints[targetStep].gameState);
    this.checkpoints.length = targetStep;
    return targetState;
  }

  /** Update the stored choice result at a specific step */
  updateChoiceAt(step: number, newChoice: string): void {
    if (step >= 0 && step < this.checkpoints.length) {
      this.checkpoints[step].choiceResult = newChoice;
    }
  }

  /** Set replay from beginning, trimming checkpoints after endStep */
  setReplayTo(endStep: number): void {
    this.replayIndex = 0;
    if (endStep < this.checkpoints.length) {
      this.checkpoints.length = endStep;
    }
  }

  /** Clear all checkpoints (new event or new game) */
  clear(): void {
    this.checkpoints = [];
    this.replayIndex = -1;
  }

  /** Restore checkpoints from save data (migrates legacy string foregrounds) */
  restore(checkpoints: Checkpoint[]): void {
    this.checkpoints = structuredClone(checkpoints);
    for (const cp of this.checkpoints) {
      if (typeof cp.foreground === 'string') {
        cp.foreground = normalizeForeground(cp.foreground);
      }
    }
    this.replayIndex = -1;
  }
}
