import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

export default {
    id: 'pickup_old_key',
    locationId: 'hallway',
    conditions: (_state: GameState) => false,
    execute: async (engine: VylosEventAPI, state: GameState) => {
        engine.inventory.add('misc', 'old_key');
        state.flags.pickedUpKey = true;
        await engine.say('You pick up the old key and slip it into your pocket.');
    }
} as VylosEvent<GameState>;