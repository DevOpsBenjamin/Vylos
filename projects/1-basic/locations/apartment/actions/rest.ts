import type { VylosAction, VylosGameState } from '@vylos/core';
import type { BasicGameState } from '@game/gameState';

const rest: VylosAction = {
  id: 'rest',
  label: 'Rest',
  locationId: 'apartment',

  unlocked(state: VylosGameState) {
    return (state as BasicGameState).energy < 50;
  },

  execute(state: VylosGameState) {
    const s = state as BasicGameState;
    s.energy = Math.min(100, s.energy + 30);
    s.gameTime += 2;
    s.flags['rested'] = true;
  },
};

export default rest;
