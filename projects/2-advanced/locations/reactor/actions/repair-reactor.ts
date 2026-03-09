import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.reactor.actions;

const repairReactor: Action = {
  id: 'repair_reactor',
  locationId: 'reactor',
  label: t.repairReactor,

  unlocked(state) {
    return state.station.modules.reactor.integrity < 100 && state.station.materials >= 5;
  },

  execute(_engine, state) {
    state.station.modules.reactor.actionState = 'repair';
  },
};

export default repairReactor;
