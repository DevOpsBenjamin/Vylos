import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import texts from 'vylos:texts';
const t = texts.quarters.actions;

const eat = {
  id: 'eat',
  locationId: 'quarters',
  label: t.eat,

  unlocked(state: GameState) {
    return (state.inventories['default']?.['ration-pack'] ?? 0) > 0;
  },

  execute(engine: VylosActionAPI, state: GameState) {
    engine.inventory.remove('default', 'ration-pack');
    const members = [state.crews.elena, state.crews.jax, state.crews.kael];
    for (const m of members) {
      m.stress = Math.max(0, m.stress - 5);
    }
  },
} satisfies VylosAction<GameState>;

export default eat;
