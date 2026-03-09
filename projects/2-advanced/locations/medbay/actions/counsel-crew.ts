import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.medbay.actions;

const counselCrew: Action = {
  id: 'counsel_crew',
  locationId: 'medbay',
  label: t.counselCrew,

  unlocked(state) {
    const { elena, jax, kael } = state.crews;
    return elena.stress > 30 || jax.stress > 30 || kael.stress > 30;
  },

  execute(_engine, state) {
    state.station.modules.medbay.actionState = 'counsel';
  },
};

export default counselCrew;
