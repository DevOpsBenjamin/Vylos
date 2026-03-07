import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import t from 'vylos:texts/cafe/maya_poem';

const mayaPoem: VylosEvent<GameState> = {
  id: 'maya_poem',
  locationId: 'cafe',
  conditions: (state) => state.characters.maya.affection >= 40 && !state.characters.maya.poem,
  locked: (state) => state.characters.maya.poem,

  async execute(engine: VylosEventAPI, state: GameState) {
    const { maya } = state.characters;

    engine.setBackground('/assets/locations/cafe/cafe_day.png');
    engine.setForeground('/assets/locations/cafe/maya.png');

    await engine.say(t.scene);
    await engine.say(t.offer, { from: maya });
    await engine.say(t.desc);

    const pick = await engine.choice([
      { text: t.choice_beautiful, value: 'beautiful' },
      { text: t.choice_interesting, value: 'interesting' },
      { text: t.choice_notmine, value: 'notmine' },
    ]);

    if (pick === 'beautiful') {
      await engine.say(t.beautiful_1, { from: maya });
      await engine.say(t.beautiful_2, { from: maya });
      maya.affection = Math.min(100, maya.affection + 15);
    } else if (pick === 'interesting') {
      await engine.say(t.interesting_1, { from: maya });
      await engine.say(t.interesting_2, { from: maya });
      maya.affection = Math.min(100, maya.affection + 5);
    } else {
      await engine.say(t.notmine_1, { from: maya });
      await engine.say(t.notmine_2, { from: maya });
      maya.affection = Math.max(0, maya.affection - 5);
    }

    engine.setForeground(null);
    maya.poem = true;
  },
};

export default mayaPoem;
