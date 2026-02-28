import type { VylosGameState } from './game-state';
import type { TextEntry } from './events';

/** Background resolution entry — time-based or default */
export interface BackgroundEntry {
  path: string;
  /** Time range in game hours, e.g. [6, 18] for daytime */
  timeRange?: [number, number];
}

/** Location definition */
export interface VylosLocation {
  /** Unique location ID */
  id: string;

  /** Display name */
  name: string | TextEntry;

  /** Background images (resolved by time of day) */
  backgrounds: BackgroundEntry[];

  /** Whether this location is accessible — defaults to true */
  accessible?<TState extends VylosGameState>(state: TState): boolean;
}

/** Location link (navigation graph edge) */
export interface LocationLink {
  from: string;
  to: string;
  /** Whether this link is currently traversable */
  condition?<TState extends VylosGameState>(state: TState): boolean;
}
