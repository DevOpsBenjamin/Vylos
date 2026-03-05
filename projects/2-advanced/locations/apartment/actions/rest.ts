import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

const rest: VylosAction<GameState> = {
  id: 'rest',
  label: { en: 'Rest', fr: 'Se reposer' },
  locationId: 'apartment',
  unlocked: (state) => state.player.energy < 50,
  execute(_engine: VylosActionAPI, state: GameState) {
    state.player.energy = Math.min(100, state.player.energy + 30);
    state.gameTime += 2;
    state.flags.rested = true;
  },
};

export default rest;
