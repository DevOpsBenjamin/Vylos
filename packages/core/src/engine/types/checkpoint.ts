import type { BaseGameState } from './game-state';

/** A checkpoint captured at each interaction point */
export interface Checkpoint {
  /** Sequential step number within the event */
  step: number;
  /** Deep clone of game state at this point */
  gameState: BaseGameState;
  /** Type of interaction at this step */
  type: CheckpointType;
  /** Stored choice result (for replay during rollback) */
  choiceResult?: string;
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
