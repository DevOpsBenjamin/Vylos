import type { VylosAction, VylosActionAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameState';

const orderCoffee: VylosAction = {
  id: 'order_coffee',
  label: { en: 'Order Coffee', fr: 'Commander un cafe' },
  locationId: 'cafe',

  unlocked(state: VylosGameState) {
    return (state as AdvancedGameState).flags.visitedCafe;
  },

  execute(_engine: VylosActionAPI, state: VylosGameState) {
    const s = state as AdvancedGameState;
    s.energy = Math.min(100, s.energy + 5);
    s.gameTime += 0.5;
    s.flags.orderedCoffee = true;
  },
};

export default orderCoffee;
