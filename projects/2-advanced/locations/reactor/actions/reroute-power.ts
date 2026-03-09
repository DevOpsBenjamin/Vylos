import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.reactor.actions;

const reroutePower: Action = {
  id: 'reroute_power',
  locationId: 'reactor',
  label: t.reroutePower,

  unlocked(state) {
    return state.station.energy < 80;
  },

  execute(_engine, state) {
    state.station.modules.reactor.actionState = 'reroute';
  },
};

export default reroutePower;
