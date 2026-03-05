import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

const chatMaya: VylosAction<GameState> = {
  id: 'chat_maya',
  label: { en: 'Chat with Maya', fr: 'Discuter avec Maya' },
  locationId: 'cafe',
  unlocked: (state) => state.characters.maya.met,
  execute(_engine: VylosActionAPI, state: GameState) {
    state.characters.maya.affection = Math.min(100, state.characters.maya.affection + 3);
    state.gameTime += 0.5;
    state.flags.chattedMaya = true;
  },
};

export default chatMaya;
