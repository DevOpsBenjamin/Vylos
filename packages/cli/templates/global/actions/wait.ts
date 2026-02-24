import type { VylosAction, BaseGameState } from '@vylos/core';

const wait: VylosAction = {
  id: 'wait',
  label: 'Wait 1 Hour',
  execute(state: BaseGameState) {
    state.gameTime += 1;
  },
};

export default wait;
