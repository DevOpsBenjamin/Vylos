import type { VylosAction, VylosGameState } from '@vylos/core';
import type { BasicGameState } from '@game/gameState';

const orderCoffee: VylosAction = {
  id: 'order_coffee',
  label: 'Order Coffee',
  locationId: 'cafe',

  unlocked(state: VylosGameState) {
    return state.flags['visited_cafe'] === true;
  },

  execute(state: VylosGameState) {
    const s = state as BasicGameState;
    s.energy = Math.min(100, s.energy + 5);
    s.maya_affection = Math.min(100, s.maya_affection + 2);
    s.gameTime += 0.5;
    s.flags['ordered_coffee'] = true;
  },
};

export default orderCoffee;
