import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

export default {
    id: 'hallway_intro',
    locationId: 'hallway',
    conditions: (state) => !state.flags.seenKey,
    execute: async (engine: VylosEventAPI, state: GameState) => {
        state.flags.seenKey = true;
        await engine.say('You step into the hallway. Something catches your eye — an old key lying on the floor near the wall.', { from: state.characters.narrator });
    }
} as VylosEvent<GameState>;