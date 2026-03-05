import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';
import { addJournalEntry } from '@game/helpers/journal';
import type { AdvancedGameState } from '@game/gameDatas/gameState';

const intro: VylosEvent = {
  id: 'intro',

  conditions(state: VylosGameState) {
    return !state.flags['intro_done'];
  },

  locked: (state) => state.flags['intro_done'] === true,

  async execute(engine: VylosEventAPI, _state: VylosGameState) {
    const state = _state as AdvancedGameState;

    await engine.say('Moving vans, cardboard boxes, and the scent of a city you barely know.');
    await engine.say(`You've arrived in the heart of the city, chasing something — a fresh start, maybe love, maybe both.`);
    await engine.say('Your new apartment is small but full of possibility. The neighbors? Completely unknown.');
    await engine.say('But first — who are you, exactly?');

    const name = await engine.choice([
      { text: 'Alex', value: 'Alex' },
      { text: 'Sam', value: 'Sam' },
      { text: 'Jordan', value: 'Jordan' },
      { text: 'Riley', value: 'Riley' },
    ]);

    state.player.name = name;
    await engine.say(`${name}. That's who you are. And this city? It doesn't know what's coming.`);
    await engine.say('The morning light spills through dusty windows. Day one begins now.');

    state.flags['intro_done'] = true;
    state.locationId = 'apartment';
    state.gameTime = 8;

    addJournalEntry(state, 'arrival', 'Arrival', 'Moved into a new apartment in the city. Day one begins.');
  },
};

export default intro;
