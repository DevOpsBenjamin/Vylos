import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

const pickUpItem: VylosAction<GameState> = {
  id: 'pick_up_item',
  locationId: 'hallway',
  label: 'Pick Up Old Key',
  unlocked: (state) => !state.flags.pickedUpKey,
  execute(engine: VylosActionAPI, _state: GameState) {
    // jump in a item only accesible by jumpe
    engine.jump('pickup_old_key');
  },
};

export default pickUpItem;
