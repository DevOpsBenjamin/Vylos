import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.quarters.actions;

const eat: Action = {
  id: 'eat',
  locationId: 'quarters',
  label: t.eat,

  unlocked(state) {
    return (state.inventories['default']?.['ration-pack'] ?? 0) > 0;
  },

  execute(_engine, state) {
    state.station.modules.quarters.actionState = 'eat';
  },
};

export default eat;
