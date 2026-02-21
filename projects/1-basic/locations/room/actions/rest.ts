import type { VylosAction, BaseGameState } from '@vylos/core';

const rest: VylosAction = {
  id: 'rest',
  label: 'Sleep',
  locationId: 'room',
  unlocked(state: BaseGameState) {
    const hour = state.gameTime % 24;
    return hour >= 21 || hour < 4;
  },
  execute(state: BaseGameState) {
    state.flags['try_sleep'] = true;
  },
};

export default rest;
