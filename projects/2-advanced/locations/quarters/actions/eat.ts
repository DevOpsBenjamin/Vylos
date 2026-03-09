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

  execute(engine, state) {
    engine.inventory.remove('default', 'ration-pack');
    const members = [state.crews.elena, state.crews.jax, state.crews.kael];
    for (const m of members) {
      m.stress = Math.max(0, m.stress - 5);
    }
  },
};

export default eat;
