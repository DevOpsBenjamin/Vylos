import type { VylosAction, VylosGameState } from '@vylos/core';

const rest: VylosAction = {
  id: 'rest',
  label: 'Sleep',
  locationId: 'room',
  unlocked(state: VylosGameState) {
    const hour = state.gameTime % 24;
    return hour >= 21 || hour < 4;
  },
  execute(state: VylosGameState) {
    state.flags['try_sleep'] = true;
  },
};

export default rest;
