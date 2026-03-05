import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

const pickUpItem: VylosAction<GameState> = {
  id: 'old_door',
  locationId: 'home',
  label: 'Open the door',
  unlocked: (state) => state.flags.doorUnlocked,
  execute(engine: VylosActionAPI, _state: GameState) {
    // jump in a item only accesible by jumpe
    engine.jump('open_old_door');
  },
};

export default pickUpItem;
