import type { VylosAction, VylosGameState } from '@vylos/core';

const chatMaya: VylosAction = {
  id: 'chat_maya',
  label: { en: 'Chat with Maya', fr: 'Discuter avec Maya' },
  locationId: 'cafe',

  unlocked(state: VylosGameState) {
    return state.flags['met_maya'] === true;
  },

  execute(state: VylosGameState) {
    (state as any).npcs.maya.affection = Math.min(100, ((state as any).npcs.maya.affection ?? 0) + 3);
    state.gameTime += 0.5;
    state.flags['chatted_maya'] = true;
  },
};

export default chatMaya;
