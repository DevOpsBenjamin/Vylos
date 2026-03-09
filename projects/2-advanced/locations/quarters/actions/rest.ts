import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.quarters.actions;

const rest: Action = {
  id: 'rest',
  locationId: 'quarters',
  label: t.rest,

  unlocked(state) {
    const { elena, jax, kael } = state.crews;
    return elena.stress > 0 || jax.stress > 0 || kael.stress > 0;
  },

  execute(_engine, state) {
    state.station.modules.quarters.actionState = 'rest';
  },
};

export default rest;
