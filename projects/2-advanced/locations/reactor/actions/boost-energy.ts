import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.reactor.actions;

const boostEnergy: Action = {
  id: 'boost_energy',
  locationId: 'reactor',
  label: t.boostEnergy,

  unlocked(state) {
    return state.station.energy < 60;
  },

  execute(_engine, state) {
    state.station.energy = Math.min(100, state.station.energy + 15);
    const reactor = state.station.modules.reactor;
    reactor.integrity = Math.max(0, reactor.integrity - 5);
    if (reactor.integrity < 30) {
      reactor.damaged = true;
    }
  },
};

export default boostEnergy;
