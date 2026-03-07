import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { addJournalEntry } from '@game/helpers/journal';
import t from 'vylos:texts/cafe/first_visit';

const firstVisit: VylosEvent<GameState> = {
  id: 'first_visit',
  locationId: 'cafe',
  conditions: (state) => state.flags.wokeUp && !state.flags.visitedCafe,
  locked: (state) => state.flags.visitedCafe,

  async execute(engine: VylosEventAPI, state: GameState) {
    const { maya } = state.characters;

    engine.setBackground('/assets/locations/cafe/cafe_day.png');
    await engine.say(t.enter);
    await engine.say(t.aroma);

    engine.setForeground('/assets/locations/cafe/maya.png');
    await engine.say(t.maya_appears, { from: maya });
    await engine.say(t.maya_greeting, { from: maya });

    const pick = await engine.choice([
      { text: t.choice_flirt, value: 'flirt' },
      { text: t.choice_friendly, value: 'friendly' },
      { text: t.choice_shy, value: 'shy' },
    ]);

    if (pick === 'flirt') {
      await engine.say(t.flirt_reply, { from: maya });
      maya.affection = Math.min(100, maya.affection + 15);
    } else if (pick === 'friendly') {
      await engine.say(t.friendly_reply, { from: maya });
      maya.affection = Math.min(100, maya.affection + 10);
    } else {
      await engine.say(t.shy_reply, { from: maya });
      maya.affection = Math.min(100, maya.affection + 5);
    }

    await engine.say(t.cup_slide);
    engine.setForeground(null);

    state.flags.visitedCafe = true;
    maya.met = true;
    state.gameTime += 1;

    addJournalEntry(state, 'met_maya', 'Met Maya', 'Visited the Rosebud Cafe and met Maya, the barista.');
  },
};

export default firstVisit;
