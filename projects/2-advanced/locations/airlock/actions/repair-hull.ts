import type { Action } from '@game/types';
import { BALANCE } from '@game/gameState/time';
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
    state.station.materials -= 5;
    const airlock = state.station.modules.airlock;
    airlock.integrity = Math.min(100, airlock.integrity + BALANCE.repairAmount);
    if (airlock.integrity >= 80) {
      state.flags.hullBreachSealed = true;
    }
    if (airlock.integrity >= 30) {
      airlock.damaged = false;
    }
  },
};

export default repairHull;
