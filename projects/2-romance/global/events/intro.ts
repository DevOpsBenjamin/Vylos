import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const intro: VylosEvent = {
  id: 'intro',

  conditions(state: BaseGameState) {
    return !state.flags['intro_done'];
  },

  async execute(engine: VylosAPI, state: BaseGameState) {
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
  },
};

export default intro;
