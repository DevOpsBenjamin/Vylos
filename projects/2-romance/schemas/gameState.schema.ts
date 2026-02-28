import type { VylosGameState } from '@vylos/core';

interface NpcState {
  affection: number;
  met: boolean;
  dates: number;
  events: string[];
}

export interface GameState extends VylosGameState {
  energy: number;
  charm: number;
  day: number;
  npcs: { maya: NpcState; lena: NpcState };
  inventory: string[];
}
