import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.airlock.actions;

const scavenge: Action = {
  id: 'scavenge',
  locationId: 'airlock',
  label: t.scavenge,

  unlocked(state) {
    return state.station.materials < 50;
  },

  execute(_engine, state) {
    state.station.modules.airlock.actionState = 'scavenge';
  },
};

export default scavenge;
