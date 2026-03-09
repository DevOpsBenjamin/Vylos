import type { Action } from '@game/types';
import { BALANCE } from '@game/gameState/time';
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
    const members = [state.crews.elena, state.crews.jax, state.crews.kael];
    // Find the most stressed crew member
    let mostStressed = members[0];
    for (const m of members) {
      if (m.stress > mostStressed.stress) {
        mostStressed = m;
      }
    }
    const reduction = Math.abs(BALANCE.stressPerRest);
    mostStressed.stress = Math.max(0, mostStressed.stress - reduction);
  },
};

export default counselCrew;
