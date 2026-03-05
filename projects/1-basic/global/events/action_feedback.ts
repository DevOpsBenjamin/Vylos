import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';
import { maya } from '@game';

const actionFeedback: VylosEvent = {
  id: 'action_feedback',

  conditions(state: VylosGameState) {
    return (
      state.flags['rested'] === true ||
      state.flags['ordered_coffee'] === true
    );
  },

  async execute(engine: VylosEventAPI, state: VylosGameState) {
    if (state.flags['rested']) {
      state.flags['rested'] = false;
      await engine.say('You close your eyes and let the hours drift by. Much better — energy restored.');
    }

    if (state.flags['ordered_coffee']) {
      state.flags['ordered_coffee'] = false;
      await engine.say('Maya slides a fresh cup across the counter. The warmth settles into your hands.', { from: maya });
    }
  },
};

export default actionFeedback;
