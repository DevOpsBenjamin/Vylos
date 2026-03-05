import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { addJournalEntry } from '@game/helpers/journal';
import t from 'vylos:texts/global/intro';

const intro: VylosEvent<GameState> = {
  id: 'intro',
  conditions: (state) => !state.flags.introDone,
  locked: (state) => state.flags.introDone,

  async execute(engine: VylosEventAPI, state: GameState) {
    await engine.say(t.moving_day);
    await engine.say(t.arrived);
    await engine.say(t.new_apartment);
    await engine.say(t.who_are_you);

    const name = await engine.choice([
      { text: 'Alex', value: 'Alex' },
      { text: 'Sam', value: 'Sam' },
      { text: 'Jordan', value: 'Jordan' },
      { text: 'Riley', value: 'Riley' },
    ]);

    state.player.name = name;
    await engine.say(t.name_confirm, { variables: { name } });
    await engine.say(t.day_begins);

    state.flags.introDone = true;
    state.locationId = 'apartment';
    state.gameTime = 8;

    addJournalEntry(state, 'arrival', 'Arrival', 'Moved into a new apartment in the city. Day one begins.');
  },
};

export default intro;
