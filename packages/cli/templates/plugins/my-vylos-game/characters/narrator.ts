import type { Character } from './index';

/** Narrator — used for general story text. */
export interface NarratorCharacter extends Character {}

export function createNarrator(): NarratorCharacter {
    return {
        id: 'narrator',
        name: 'Narrator',
        color: '#9704c4',
    };
}
