import type { VylosAction, VylosGameState } from '@vylos/core';

const rest: VylosAction = {
  id: 'rest',
  label: { en: 'Rest', fr: 'Se reposer' },
  locationId: 'apartment',

  unlocked(state: VylosGameState) {
    return ((state as any).energy ?? 100) < 50;
  },

  execute(state: VylosGameState) {
    (state as any).energy = Math.min(100, ((state as any).energy ?? 0) + 30);
    state.gameTime += 2;
    state.flags['rested'] = true;
  },
};

export default rest;
