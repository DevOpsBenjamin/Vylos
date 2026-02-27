import type { BaseGameState } from '@vylos/core';

interface NpcState {
  affection: number;
  met: boolean;
  dates: number;
  events: string[];
}

export interface GameState extends BaseGameState {
  energy: number;
  charm: number;
  day: number;
  npcs: { maya: NpcState; lena: NpcState };
  inventory: string[];
}
