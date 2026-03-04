import type { VylosAction, VylosActionAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameDatas/gameState';

const rest: VylosAction = {
  id: 'rest',
  label: { en: 'Rest', fr: 'Se reposer' },
  locationId: 'apartment',

  unlocked(state: VylosGameState) {
    return (state as AdvancedGameState).energy < 50;
  },

  execute(_engine: VylosActionAPI, state: VylosGameState) {
    const s = state as AdvancedGameState;
    s.energy = Math.min(100, s.energy + 30);
    s.gameTime += 2;
    s.flags['rested'] = true;
  },
};

export default rest;
