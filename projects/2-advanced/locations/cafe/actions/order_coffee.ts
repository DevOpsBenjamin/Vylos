import type { VylosAction, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameDatas/gameState';

const orderCoffee: VylosAction = {
  id: 'order_coffee',
  label: { en: 'Order Coffee', fr: 'Commander un cafe' },
  locationId: 'cafe',

  unlocked(state: VylosGameState) {
    return state.flags['visited_cafe'] === true;
  },

  execute(state: VylosGameState) {
    const s = state as AdvancedGameState;
    s.energy = Math.min(100, s.energy + 5);
    s.gameTime += 0.5;
    s.flags['ordered_coffee'] = true;
  },
};

export default orderCoffee;
