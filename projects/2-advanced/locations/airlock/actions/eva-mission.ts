import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.airlock.actions;

const evaMission: Action = {
  id: 'eva_mission',
  locationId: 'airlock',
  label: t.evaMission,

  unlocked(state) {
    return state.station.energy >= 2 && state.crews.kael.status === 'idle';
  },

  execute(_engine, state) {
    state.station.modules.airlock.actionState = 'eva';
  },
};

export default evaMission;
