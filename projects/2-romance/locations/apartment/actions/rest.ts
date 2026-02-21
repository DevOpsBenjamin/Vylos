import type { VylosAction, BaseGameState } from '@vylos/core';

const rest: VylosAction = {
  id: 'rest',
  label: { en: 'Rest', fr: 'Se reposer' },
  locationId: 'apartment',

  unlocked(state: BaseGameState) {
    return ((state as any).energy ?? 100) < 50;
  },

  execute(state: BaseGameState) {
    (state as any).energy = Math.min(100, ((state as any).energy ?? 0) + 30);
    state.gameTime += 2;
  },
};

export default rest;
