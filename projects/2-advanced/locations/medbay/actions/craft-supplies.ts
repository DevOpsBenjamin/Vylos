import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import texts from 'vylos:texts';
const t = texts.medbay.actions;

const craftSupplies = {
  id: 'craft_supplies',
  locationId: 'medbay',
  label: t.craftSupplies,

  unlocked(state: GameState) {
    return state.station.materials >= 3;
  },

  execute(engine: VylosActionAPI, state: GameState) {
    state.station.materials -= 3;
    engine.inventory.add('default', 'med-supplies');
  },
} satisfies VylosAction<GameState>;

export default craftSupplies;
