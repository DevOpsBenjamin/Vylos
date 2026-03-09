import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.airlock.actions;

const repairHull: Action = {
  id: 'repair_hull',
  locationId: 'airlock',
  label: t.repairHull,

  unlocked(state) {
    return state.station.modules.airlock.integrity < 100 && state.station.materials >= 5;
  },

  execute(_engine, state) {
    state.station.modules.airlock.actionState = 'repair_hull';
  },
};

export default repairHull;
