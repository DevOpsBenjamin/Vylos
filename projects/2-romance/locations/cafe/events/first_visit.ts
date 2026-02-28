import type { VylosEvent, VylosAPI, VylosGameState } from '@vylos/core';
import { maya } from '../../../characters';

const firstVisit: VylosEvent = {
  id: 'first_visit',
  locationId: 'cafe',

  conditions(state: VylosGameState) {
    return state.flags['woke_up'] === true && !state.flags['visited_cafe'];
  },

  async execute(engine: VylosAPI, state: VylosGameState) {
    engine.setBackground('/assets/locations/cafe/cafe_day.png');
    await engine.say('The Rosebud Cafe is a small corner place with warm lighting and mismatched chairs.');
    await engine.say(`The smell of fresh espresso hits you at the door — rich, inviting, like a hug you didn't know you needed.`);

    engine.setForeground('/assets/locations/cafe/maya.png');
    await engine.say('Behind the counter, a woman with flour on her sleeve glances up and breaks into a grin.', { from: maya });
    await engine.say(`"New face! Don't be shy — I don't bite. Usually."`, { from: maya });

    const pick = await engine.choice([
      { text: `Flirt: "Good to know. I like to take my chances."`, value: 'flirt' },
      { text: `Friendly: "I just moved in nearby. Thought I'd check it out."`, value: 'friendly' },
      { text: 'Shy: "Oh, um — hi. A coffee, please?"', value: 'shy' },
    ]);

    if (pick === 'flirt') {
      await engine.say(`She laughs — a real one, surprised out of her. "I like you already. Name's Maya."`, { from: maya });
      (state as any).npcs.maya.affection = ((state as any).npcs.maya.affection ?? 0) + 15;
    } else if (pick === 'friendly') {
      await engine.say(`"Oh perfect timing — we just started doing weekday specials. I'm Maya."`, { from: maya });
      (state as any).npcs.maya.affection = ((state as any).npcs.maya.affection ?? 0) + 10;
    } else {
      await engine.say(`She softens instantly. "Of course! Coming right up. I'm Maya — welcome."`, { from: maya });
      (state as any).npcs.maya.affection = ((state as any).npcs.maya.affection ?? 0) + 5;
    }

    await engine.say('She slides a cup across the counter with a small, knowing smile.');
    engine.setForeground(null);

    state.flags['visited_cafe'] = true;
    state.flags['met_maya'] = true;
    (state as any).npcs.maya.met = true;
    state.gameTime += 1;
  },
};

export default firstVisit;
