import type { VylosAction, BaseGameState } from '@vylos/core';

const chatMaya: VylosAction = {
  id: 'chat_maya',
  label: { en: 'Chat with Maya', fr: 'Discuter avec Maya' },
  locationId: 'cafe',

  unlocked(state: BaseGameState) {
    return state.flags['met_maya'] === true;
  },

  execute(state: BaseGameState) {
    (state as any).npcs.maya.affection = Math.min(100, ((state as any).npcs.maya.affection ?? 0) + 3);
    state.gameTime += 0.5;
  },
};

export default chatMaya;
