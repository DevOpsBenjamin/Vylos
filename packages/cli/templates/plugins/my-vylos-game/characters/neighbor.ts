import type { Character } from './index';

/** A friendly neighbor NPC. Custom fields like `meet` show how to track per-character state. */
export interface NeighborCharacter extends Character {
    meet: boolean;
}

export function createNeighbor(): NeighborCharacter {
    return {
        id: 'neighbor',
        name: 'Neighbor',
        color: '#4a90e2',
        meet: false,
    };
}
