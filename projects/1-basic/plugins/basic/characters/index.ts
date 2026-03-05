import type { VylosCharacter } from '@vylos/core';

import { type NarratorCharacter, createNarrator } from './narrator';
import { type NeighborCharacter, createNeighbor } from './neighbor';

/**
 * Base character interface for your project.
 * Add shared fields here (e.g. relationship, portrait) that apply to all characters.
 */
export interface Character extends VylosCharacter {}

/** All characters stored in game state, keyed by role. */
export interface Characters {
    narrator: NarratorCharacter;
    neighbor: NeighborCharacter;
}

export function createCharacters(): Characters {
    return {
        narrator: createNarrator(),
        neighbor: createNeighbor(),
    };
}
