import type { VylosCharacter } from './dialogue';
import type { InventoryData } from './inventory';

/** Base game state — projects extend this into their own GameState */
export interface VylosGameState {
  /** Current location ID */
  locationId: string;
  /** In-game time (hours since game start, e.g. 14.5 = 2:30 PM) */
  gameTime: number;
  /** Generic flags for event gating */
  flags: Record<string, boolean>;
  /** Generic counters */
  counters: Record<string, number>;
  /** Player character */
  player: VylosCharacter;
  /** Inventory data: bag/category ID -> item ID -> quantity */
  inventories: InventoryData;
}
