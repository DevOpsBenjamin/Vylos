import type { VylosCharacter } from '@vylos/core';

/** Player character — extend with game-specific stats. */
export interface Player extends VylosCharacter {
  energy: number;
  charm: number;
  day: number;
}

export function createPlayer(): Player {
  return {
    id: 'player',
    name: 'Player',
    energy: 100,
    charm: 20,
    day: 1,
  };
}
