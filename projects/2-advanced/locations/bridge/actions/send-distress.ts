import type { Action } from '@game/types';
import texts from 'vylos:texts';
const t = texts.bridge.actions;

const sendDistress: Action = {
  id: 'send_distress',
  locationId: 'bridge',
  label: t.sendDistress,

  unlocked(state) {
    return !state.flags.distressSignalSent;
  },

  execute(_engine, state) {
    state.flags.distressSignalSent = true;
  },
};

export default sendDistress;
