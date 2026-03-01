import type { VylosGameState } from './game-state';
import type { DialogueState, ChoiceOption, ForegroundLayer } from './engine';

/** A checkpoint captured at each interaction point */
export interface Checkpoint {
  /** Sequential step number within the event */
  step: number;
  /** Deep clone of game state at this point */
  gameState: VylosGameState;
  /** Type of interaction at this step */
  type: CheckpointType;
  /** Stored choice result (for replay during rollback) */
  choiceResult?: string;
  /** Dialogue state at this point (for history browsing) */
  dialogue?: DialogueState | null;
  /** Background path at this point */
  background?: string | null;
  /** Foreground layers at this point */
  foreground?: ForegroundLayer[] | null;
  /** Available choice options at this step (for history redo) */
  choiceOptions?: ChoiceOption[];
}

export enum CheckpointType {
  /** Player pressed continue after dialogue */
  Say = 'say',
  /** Player made a choice */
  Choice = 'choice',
  /** Wait completed */
  Wait = 'wait',
  /** Overlay interaction */
  Overlay = 'overlay',
}
