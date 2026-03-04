import type { VylosAction, VylosActionAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameDatas/gameState';
import { modAffection } from '@game/helpers/relationships';

const chatMaya: VylosAction = {
  id: 'chat_maya',
  label: { en: 'Chat with Maya', fr: 'Discuter avec Maya' },
  locationId: 'cafe',

  unlocked(state: VylosGameState) {
    return state.flags['met_maya'] === true;
  },

  execute(_engine: VylosActionAPI, state: VylosGameState) {
    const s = state as AdvancedGameState;
    modAffection(s, 'maya', 3);
    s.gameTime += 0.5;
    s.flags['chatted_maya'] = true;
  },
};

export default chatMaya;
