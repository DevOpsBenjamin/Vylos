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
    state.station.modules.reactor.actionState = 'boost';
  },
};

export default boostEnergy;
