import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import t from 'vylos:texts/cafe/maya_date';

const mayaDate: VylosEvent<GameState> = {
  id: 'maya_date',
  locationId: 'cafe',
  conditions: (state) => state.characters.maya.affection >= 60 && !state.characters.maya.date1,
  locked: (state) => state.characters.maya.date1,

  async execute(engine: VylosEventAPI, state: GameState) {
    const { maya } = state.characters;

    engine.setBackground('/assets/locations/cafe/cafe_day.png');
    engine.setForeground('/assets/locations/cafe/maya.png');

    await engine.say(t.closing);
    await engine.say(t.invite, { from: maya });
    await engine.say(t.look, { from: maya });
    await engine.say(t.park_suggest, { from: maya });

    const pick = await engine.choice([
      { text: t.choice_yes, value: 'yes' },
      { text: t.choice_no, value: 'no' },
    ]);

    if (pick === 'yes') {
      await engine.say(t.yes_reply, { from: maya });
      maya.date1 = true;
      state.locationId = 'park';
      state.gameTime += 0.5;
    } else {
      await engine.say(t.no_reply, { from: maya });
    }

    engine.setForeground(null);
  },
};

export default mayaDate;
