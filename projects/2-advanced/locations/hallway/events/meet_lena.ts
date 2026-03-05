import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { addJournalEntry } from '@game/helpers/journal';
import t from 'vylos:texts/hallway/meet_lena';

const meetLena: VylosEvent<GameState> = {
  id: 'meet_lena',
  locationId: 'hallway',
  conditions: (state) => state.flags.foundLetter && !state.characters.lena.met,
  locked: (state) => state.characters.lena.met,

  async execute(engine: VylosEventAPI, state: GameState) {
    const { lena } = state.characters;

    engine.setBackground('/assets/locations/hallway/hallway.png');
    await engine.say(t.enter);
    await engine.say(t.groceries);

    engine.setForeground('/assets/locations/hallway/lena.png');
    await engine.say(t.eggs, { from: lena });
    await engine.say(t.crouching);

    const pick = await engine.choice([
      { text: t.choice_help, value: 'help' },
      { text: t.choice_hi, value: 'hi' },
    ]);

    if (pick === 'help') {
      await engine.say(t.help_1);
      await engine.say(t.help_2, { from: lena });
      await engine.say(t.help_3);
      await engine.say(t.help_4, { from: lena });
      lena.affection = Math.min(100, lena.affection + 15);
    } else {
      await engine.say(t.hi_1);
      await engine.say(t.hi_2, { from: lena });
      await engine.say(t.hi_3, { from: lena });
      lena.affection = Math.min(100, lena.affection + 5);
    }

    engine.setForeground(null);
    await engine.say(t.farewell);

    lena.met = true;
    lena.known = true;

    addJournalEntry(state, 'met_lena', 'Met Lena', 'Bumped into the neighbor from 4B — Lena. She seems kind.');
  },
};

export default meetLena;
