import type { VylosAction, VylosActionAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameState';

const groom: VylosAction = {
  id: 'groom',
  label: { en: 'Freshen Up', fr: 'Se rafraichir' },
  locationId: 'apartment',

  unlocked(_state: VylosGameState) {
    return true;
  },

  execute(_engine: VylosActionAPI, state: VylosGameState) {
    const s = state as AdvancedGameState;
    s.charm = Math.min(100, s.charm + 5);
    s.gameTime += 0.5;
    s.flags.freshenedUp = true;
  },
};

export default groom;
