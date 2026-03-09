import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.medbay.actions;

const healCrew: Action = {
  id: 'heal_crew',
  locationId: 'medbay',
  label: t.healCrew,

  unlocked(state) {
    const { elena, jax, kael } = state.crews;
    return elena.status === 'injured' || jax.status === 'injured' || kael.status === 'injured';
  },

  execute(_engine, state) {
    const members = [state.crews.elena, state.crews.jax, state.crews.kael];
    const injured = members.find((m) => m.status === 'injured');
    if (injured) {
      injured.status = 'idle';
    }
  },
};

export default healCrew;
