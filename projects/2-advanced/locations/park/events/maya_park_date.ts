import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { addJournalEntry } from '@game/helpers/journal';
import t from 'vylos:texts/park/maya_park_date';

const mayaParkDate: VylosEvent<GameState> = {
  id: 'maya_park_date',
  locationId: 'park',
  conditions: (state) => state.characters.maya.date1 && !state.characters.maya.parkDone,
  locked: (state) => state.characters.maya.parkDone,

  async execute(engine: VylosEventAPI, state: GameState) {
    const { maya } = state.characters;

    engine.setBackground('/assets/locations/park/park_sunset.jpg');
    engine.setForeground('/assets/locations/park/maya_casual.png');

    await engine.say(t.walking);
    await engine.say(t.sunset);
    await engine.say(t.travel, { from: maya });
    await engine.say(t.here, { from: maya });
    await engine.say(t.glance);

    const pick = await engine.choice([
      { text: t.choice_share, value: 'share' },
      { text: t.choice_light, value: 'light' },
    ]);

    if (pick === 'share') {
      await engine.say(t.share_1);
      await engine.say(t.share_2);
      await engine.say(t.share_3, { from: maya });
      await engine.say(t.share_4);
      maya.affection = Math.min(100, maya.affection + 20);
    } else {
      await engine.say(t.light_1);
      await engine.say(t.light_2, { from: maya });
      await engine.say(t.light_3, { from: maya });
      maya.affection = Math.min(100, maya.affection + 10);
    }

    engine.setForeground(null);
    maya.parkDone = true;
    maya.dates += 1;
    state.gameTime += 2;

    addJournalEntry(state, 'park_date_maya', 'Sunset Walk', 'Walked along the river with Maya at sunset. She opened up about her dreams.');
  },
};

export default mayaParkDate;
