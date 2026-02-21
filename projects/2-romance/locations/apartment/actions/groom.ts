import type { VylosAction, BaseGameState } from '@vylos/core';

const groom: VylosAction = {
  id: 'groom',
  label: { en: 'Freshen Up', fr: 'Se rafraichir' },
  locationId: 'apartment',

  unlocked(_state: BaseGameState) {
    return true;
  },

  execute(state: BaseGameState) {
    (state as any).charm = Math.min(100, ((state as any).charm ?? 20) + 5);
    state.gameTime += 0.5;
  },
};

export default groom;
