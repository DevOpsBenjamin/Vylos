import type { VylosAction, VylosActionAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameState';

const chatMaya: VylosAction = {
  id: 'chat_maya',
  label: { en: 'Chat with Maya', fr: 'Discuter avec Maya' },
  locationId: 'cafe',

  unlocked(state: VylosGameState) {
    return (state as AdvancedGameState).characters.maya.met;
  },

  execute(_engine: VylosActionAPI, state: VylosGameState) {
    const s = state as AdvancedGameState;
    s.characters.maya.affection = Math.min(100, s.characters.maya.affection + 3);
    s.gameTime += 0.5;
    s.flags.chattedMaya = true;
  },
};

export default chatMaya;
