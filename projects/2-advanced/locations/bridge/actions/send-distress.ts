import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import t from 'vylos:texts/bridge/actions';

const sendDistress = {
  id: 'send_distress',
  locationId: 'bridge',
  label: t.sendDistress,

  unlocked(state: GameState) {
    return !state.flags.distressSignalSent;
  },

  execute(_engine: VylosActionAPI, state: GameState) {
    state.flags.distressSignalSent = true;
  },
} satisfies VylosAction<GameState>;

export default sendDistress;
