import type { VylosAction, VylosGameState } from '@vylos/core';

const wait: VylosAction = {
  id: 'wait',
  label: 'Wait 1 Hour',
  execute(state: VylosGameState) {
    state.gameTime += 1;
  },
};

export default wait;
