import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import t from 'vylos:texts/global/action_feedback';

const actionFeedback: VylosEvent<GameState> = {
  id: 'action_feedback',
  conditions: (state) => state.flags.freshenedUp || state.flags.rested || state.flags.orderedCoffee || state.flags.chattedMaya,

  async execute(engine: VylosEventAPI, state: GameState) {
    if (state.flags.freshenedUp) {
      state.flags.freshenedUp = false;
      await engine.say(t.freshened_up);
    }

    if (state.flags.rested) {
      state.flags.rested = false;
      await engine.say(t.rested);
    }

    if (state.flags.orderedCoffee) {
      state.flags.orderedCoffee = false;
      await engine.say(t.ordered_coffee);
    }

    if (state.flags.chattedMaya) {
      state.flags.chattedMaya = false;
      await engine.say(t.chatted_maya, { from: state.characters.maya });
    }
  },
};

export default actionFeedback;
