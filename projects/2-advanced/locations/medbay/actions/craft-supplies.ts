import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.medbay.actions;

const craftSupplies: Action = {
  id: 'craft_supplies',
  locationId: 'medbay',
  label: t.craftSupplies,

  unlocked(state) {
    return state.station.materials >= 3;
  },

  execute(_engine, state) {
    state.station.modules.medbay.actionState = 'craft';
  },
};

export default craftSupplies;
