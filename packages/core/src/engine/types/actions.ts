import type { VylosGameState } from './game-state';
import type { TextEntry, VylosActionAPI } from './events';

/** An action available to the player at a location */
export interface VylosAction<TState extends VylosGameState = VylosGameState> {
  /** Unique action ID */
  id: string;

  /** Display label */
  label: string | TextEntry;

  /** Location this action belongs to (null for global) */
  locationId?: string;

  /** Whether this action is currently available */
  unlocked?(state: TState): boolean;

  /** Execute the action — has access to jump() and inventory via engine */
  execute(engine: VylosActionAPI, state: TState): void;
}
