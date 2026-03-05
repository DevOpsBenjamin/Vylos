import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

const itemFeedback: VylosEvent<GameState> = {
  id: 'item_feedback',
  conditions: (state) => state.flags.pickedUpKey && !state.characters.neighbor.meet,
  async execute(engine: VylosEventAPI, state: GameState) {
    state.characters.neighbor.meet = true;
    const neighbor = state.characters.neighbor;
    await engine.say('Oh — you found that old key! I have been wondering where it went.', { from: neighbor });
    await engine.say('There is a locked door at the end of the hallway. Maybe it fits?', { from: neighbor });
    state.flags.doorUnlocked = true;
  },
};

export default itemFeedback;
