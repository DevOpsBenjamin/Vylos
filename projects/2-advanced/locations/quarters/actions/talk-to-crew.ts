import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.quarters.actions;

const talkToCrew: Action = {
  id: 'talk_to_crew',
  locationId: 'quarters',
  label: t.talkToCrew,

  unlocked(state) {
    const members = [state.crews.elena, state.crews.jax, state.crews.kael];
    return members.some((m) => m.location === 'quarters' && m.status === 'idle');
  },

  execute(_engine, state) {
    state.station.modules.quarters.actionState = 'talk';
  },
};

export default talkToCrew;
