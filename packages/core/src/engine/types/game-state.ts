/** Base game state that all projects extend via Zod schema */
export interface BaseGameState {
  /** Current location ID */
  locationId: string;
  /** In-game time (hours since game start, e.g. 14.5 = 2:30 PM) */
  gameTime: number;
  /** Generic flags for event gating */
  flags: Record<string, boolean>;
  /** Generic counters */
  counters: Record<string, number>;
  /** Player data */
  player: {
    name: string;
  };
}
