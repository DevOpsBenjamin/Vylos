import type { Action } from '@game/types';
import { BALANCE } from '@game/gameState/time';
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
    state.station.materials -= 5;
    const reactor = state.station.modules.reactor;
    reactor.integrity = Math.min(100, reactor.integrity + BALANCE.repairAmount);
    if (reactor.integrity >= 30) {
      reactor.damaged = false;
    }
  },
};

export default repairReactor;
