import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

const groom: VylosAction<GameState> = {
  id: 'groom',
  label: { en: 'Freshen Up', fr: 'Se rafraichir' },
  locationId: 'apartment',
  execute(_engine: VylosActionAPI, state: GameState) {
    state.player.charm = Math.min(100, state.player.charm + 5);
    state.gameTime += 0.5;
    state.flags.freshenedUp = true;
  },
};

export default groom;
