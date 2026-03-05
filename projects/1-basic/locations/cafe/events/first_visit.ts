import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';
import { maya } from '@game';
import type { BasicGameState } from '@game/gameState';

const firstVisit: VylosEvent = {
  id: 'first_visit',
  locationId: 'cafe',

  conditions(state: VylosGameState) {
    return state.flags['woke_up'] === true && !state.flags['visited_cafe'];
  },

  locked: (state) => state.flags['visited_cafe'] === true,

  async execute(engine: VylosEventAPI, _state: VylosGameState) {
    const state = _state as BasicGameState;

    engine.setBackground('/assets/locations/cafe/cafe_day.png');
    await engine.say('The Rosebud Cafe is a cozy corner place with warm lighting.');
    await engine.say('The smell of fresh espresso fills the air.');

    engine.setForeground('/assets/locations/cafe/maya.png');
    await engine.say('Behind the counter, a woman with flour on her sleeve grins at you.', { from: maya });
    await engine.say(`"New face! I'm Maya. What can I get you?"`, { from: maya });

    const pick = await engine.choice([
      { text: `"Something strong — it's been a long morning."`, value: 'strong' },
      { text: '"Whatever you recommend."', value: 'recommend' },
    ]);

    if (pick === 'strong') {
      await engine.say('"Coming right up. I like someone who knows what they need."', { from: maya });
      state.maya_affection += 5;
    } else {
      await engine.say('"Trusting already? I respect that." She winks and gets to work.', { from: maya });
      state.maya_affection += 10;
    }

    await engine.say('She slides a cup across the counter with a small, knowing smile.');
    engine.setForeground(null);

    state.flags['visited_cafe'] = true;
    state.flags['met_maya'] = true;
    state.gameTime += 1;
  },
};

export default firstVisit;
