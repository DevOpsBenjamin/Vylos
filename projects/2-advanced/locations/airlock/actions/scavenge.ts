import type { Action } from '@game/types';
import { BALANCE } from '@game/gameState/time';
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
    state.station.materials = Math.min(50, state.station.materials + BALANCE.scavengeAmount);
  },
};

export default scavenge;
