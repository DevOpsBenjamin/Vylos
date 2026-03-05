import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameState';

const actionFeedback: VylosEvent = {
  id: 'action_feedback',

  conditions(state: VylosGameState) {
    const s = state as AdvancedGameState;
    return s.flags.freshenedUp || s.flags.rested || s.flags.orderedCoffee || s.flags.chattedMaya;
  },

  async execute(engine: VylosEventAPI, _state: VylosGameState) {
    const state = _state as AdvancedGameState;

    if (state.flags.freshenedUp) {
      state.flags.freshenedUp = false;
      await engine.say('A quick splash of water, a fresh shirt. You feel a bit more confident.');
    }

    if (state.flags.rested) {
      state.flags.rested = false;
      await engine.say('You close your eyes and let the hours drift by. Much better — energy restored.');
    }

    if (state.flags.orderedCoffee) {
      state.flags.orderedCoffee = false;
      await engine.say('The warm cup settles in your hands. A small boost, but it helps.');
    }

    if (state.flags.chattedMaya) {
      state.flags.chattedMaya = false;
      await engine.say('You exchange a few words with Maya. Her smile lingers as you walk away.', { from: state.characters.maya });
    }
  },
};

export default actionFeedback;
