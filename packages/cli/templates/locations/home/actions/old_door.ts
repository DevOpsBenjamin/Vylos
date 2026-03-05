import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

const oldDoor: VylosAction<GameState> = {
  id: 'old_door',
  locationId: 'home',
  label: 'Open the door',
  unlocked: (state) => state.flags.doorUnlocked,
  execute(engine: VylosActionAPI, _state: GameState) {
    // Actions can jump to events that are not auto-triggered (conditions: () => false).
    engine.jump('open_old_door');
  },
};

export default oldDoor;
