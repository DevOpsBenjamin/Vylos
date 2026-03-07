import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { addJournalEntry } from '@game/helpers/journal';
import t from 'vylos:texts/neighbor/dinner_at_lena';

const dinnerAtLena: VylosEvent<GameState> = {
  id: 'dinner_at_lena',
  locationId: 'neighbor',
  conditions: (state) => state.characters.lena.invited && !state.characters.lena.dinnerDone,
  locked: (state) => state.characters.lena.dinnerDone,

  async execute(engine: VylosEventAPI, state: GameState) {
    const { lena } = state.characters;

    engine.setBackground('/assets/locations/neighbor/lena_apartment.png');
    engine.setForeground('/assets/locations/neighbor/lena.png');

    await engine.say(t.smell);
    await engine.say(t.canvases);
    await engine.say(t.you_came, { from: lena });
    await engine.say(t.wine);

    const pick = await engine.choice([
      { text: t.choice_art, value: 'art' },
      { text: t.choice_food, value: 'food' },
      { text: t.choice_flirt, value: 'flirt' },
    ]);

    if (pick === 'art') {
      await engine.say(t.art_1, { from: lena });
      await engine.say(t.art_2, { from: lena });
      await engine.say(t.art_3);
      lena.affection = Math.min(100, lena.affection + 15);
    } else if (pick === 'food') {
      await engine.say(t.food_1);
      await engine.say(t.food_2, { from: lena });
      await engine.say(t.food_3);
      lena.affection = Math.min(100, lena.affection + 10);
    } else if (state.player.charm >= 50) {
      await engine.say(t.flirt_charm);
      await engine.say(t.flirt_blush, { from: lena });
      await engine.say(t.flirt_trouble, { from: lena });
      lena.affection = Math.min(100, lena.affection + 20);
    } else {
      await engine.say(t.flirt_fail_1);
      await engine.say(t.flirt_fail_2);
    }

    engine.setForeground(null);
    lena.dinnerDone = true;
    lena.dates += 1;
    state.gameTime += 3;

    addJournalEntry(state, 'dinner_lena', 'Dinner at Lena\'s', 'Had dinner at Lena\'s place. Her apartment is full of paintings.');
  },
};

export default dinnerAtLena;
