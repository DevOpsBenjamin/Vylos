import type { Character } from './index';

export interface LenaCharacter extends Character {
  met: boolean;
  known: boolean;
  affection: number;
  dates: number;
  invited: boolean;
  dinnerDone: boolean;
  painting: boolean;
}

export function createLena(): LenaCharacter {
  return {
    id: 'lena',
    name: 'Lena',
    color: '#4a90e2',
    met: false,
    known: false,
    affection: 0,
    dates: 0,
    invited: false,
    dinnerDone: false,
    painting: false,
  };
}
