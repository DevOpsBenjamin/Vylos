import type { Character } from './index';

export interface MayaCharacter extends Character {
  met: boolean;
  affection: number;
  dates: number;
  poem: boolean;
  date1: boolean;
  parkDone: boolean;
}

export function createMaya(): MayaCharacter {
  return {
    id: 'maya',
    name: 'Maya',
    color: '#e24a7a',
    met: false,
    affection: 0,
    dates: 0,
    poem: false,
    date1: false,
    parkDone: false,
  };
}
