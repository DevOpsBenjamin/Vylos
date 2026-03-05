import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

export default {
    id: 'open_old_door',
    locationId: 'home',
    conditions: (_state: GameState) => false,
    execute: async (engine: VylosEventAPI, state: GameState) => {
        engine.inventory.remove('misc', 'old_key');
        await engine.say("The door is just a simple pantry and the key broke in the lock.");
        state.flags.doorUnlocked = false;
    }
} as VylosEvent<GameState>;