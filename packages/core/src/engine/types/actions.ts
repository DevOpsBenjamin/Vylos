import type { BaseGameState } from './game-state';
import type { TextEntry } from './events';

/** An action available to the player at a location */
export interface VylosAction<TState extends BaseGameState = BaseGameState> {
  /** Unique action ID */
  id: string;

  /** Display label */
  label: string | TextEntry;

  /** Location this action belongs to (null for global) */
  locationId?: string;

  /** Whether this action is currently available */
  unlocked?(state: TState): boolean;

  /** Execute the action (synchronous state mutation) */
  execute(state: TState): void;
}
