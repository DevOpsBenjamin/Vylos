import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game';

const wait: VylosAction<GameState> = {
  id: 'wait',
  label: 'Wait 1 Hour',
  execute(_engine: VylosActionAPI, state: GameState) {
    state.gameTime += 1;
  },
};

export default wait;
