import type { Character } from './characters';

/** Extend Character with your player-specific fields */
export interface Player extends Character {
  // health: number;
  // gold: number;
}

export function createPlayer(): Player {
  return {
    id: 'player',
    name: 'Player',
    // health: 100,
    // gold: 0,
  };
}
