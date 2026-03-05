import type { VylosCharacter } from '@vylos/core';

/** Player character — extend with game-specific stats like gold, health, etc. */
export interface Player extends VylosCharacter {
    gold: number;
}

export function createPlayer(): Player {
  return {
    id: 'player',
    name: 'Player',
    gold: 10,
  };
}
