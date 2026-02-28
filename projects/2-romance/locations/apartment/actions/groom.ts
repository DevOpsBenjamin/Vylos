import type { VylosAction, VylosGameState } from '@vylos/core';

const groom: VylosAction = {
  id: 'groom',
  label: { en: 'Freshen Up', fr: 'Se rafraichir' },
  locationId: 'apartment',

  unlocked(_state: VylosGameState) {
    return true;
  },

  execute(state: VylosGameState) {
    (state as any).charm = Math.min(100, ((state as any).charm ?? 20) + 5);
    state.gameTime += 0.5;
    state.flags['freshened_up'] = true;
  },
};

export default groom;
