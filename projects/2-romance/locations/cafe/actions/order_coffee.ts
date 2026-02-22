import type { VylosAction, BaseGameState } from '@vylos/core';

const orderCoffee: VylosAction = {
  id: 'order_coffee',
  label: { en: 'Order Coffee', fr: 'Commander un cafe' },
  locationId: 'cafe',

  unlocked(state: BaseGameState) {
    return state.flags['visited_cafe'] === true;
  },

  execute(state: BaseGameState) {
    (state as any).energy = Math.min(100, ((state as any).energy ?? 100) + 5);
    state.gameTime += 0.5;
    state.flags['ordered_coffee'] = true;
  },
};

export default orderCoffee;
