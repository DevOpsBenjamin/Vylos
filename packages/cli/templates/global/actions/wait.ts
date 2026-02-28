import type { VylosAction } from '@vylos/core';
import type { GameState } from '../../state';

const wait: VylosAction<GameState> = {
  id: 'wait',
  label: 'Wait 1 Hour',
  execute(state: GameState) {
    state.gameTime += 1;
  },
};

export default wait;
