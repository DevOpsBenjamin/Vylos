import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

const orderCoffee: VylosAction<GameState> = {
  id: 'order_coffee',
  label: { en: 'Order Coffee', fr: 'Commander un cafe' },
  locationId: 'cafe',
  unlocked: (state) => state.flags.visitedCafe,
  execute(_engine: VylosActionAPI, state: GameState) {
    state.player.energy = Math.min(100, state.player.energy + 5);
    state.gameTime += 0.5;
    state.flags.orderedCoffee = true;
  },
};

export default orderCoffee;
