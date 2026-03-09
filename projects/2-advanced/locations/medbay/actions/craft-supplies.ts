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

  execute(engine, state) {
    state.station.materials -= 3;
    engine.inventory.add('default', 'med-supplies');
  },
};

export default craftSupplies;
