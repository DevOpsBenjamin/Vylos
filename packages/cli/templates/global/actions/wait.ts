import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { advanceTime } from '@game/helpers/time';

const wait: VylosAction<GameState> = {
  id: 'wait',
  label: 'Wait 1 Hour',
  execute(_engine: VylosActionAPI, state: GameState) {
    advanceTime(state, 1);
  },
};

export default wait;
