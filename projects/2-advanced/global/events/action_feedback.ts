import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';
import { maya } from '@game';

const actionFeedback: VylosEvent = {
  id: 'action_feedback',

  conditions(state: VylosGameState) {
    return (
      state.flags['freshened_up'] === true ||
      state.flags['rested'] === true ||
      state.flags['ordered_coffee'] === true ||
      state.flags['chatted_maya'] === true
    );
  },

  async execute(engine: VylosEventAPI, state: VylosGameState) {
    if (state.flags['freshened_up']) {
      state.flags['freshened_up'] = false;
      await engine.say('A quick splash of water, a fresh shirt. You feel a bit more confident.');
    }

    if (state.flags['rested']) {
      state.flags['rested'] = false;
      await engine.say('You close your eyes and let the hours drift by. Much better — energy restored.');
    }

    if (state.flags['ordered_coffee']) {
      state.flags['ordered_coffee'] = false;
      await engine.say('The warm cup settles in your hands. A small boost, but it helps.');
    }

    if (state.flags['chatted_maya']) {
      state.flags['chatted_maya'] = false;
      await engine.say('You exchange a few words with Maya. Her smile lingers as you walk away.', { from: maya });
    }
  },
};

export default actionFeedback;
