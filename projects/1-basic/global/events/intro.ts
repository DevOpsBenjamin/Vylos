import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';

const intro: VylosEvent = {
  id: 'intro',

  conditions(state: VylosGameState) {
    return !state.flags['intro_done'];
  },

  locked: (state) => state.flags['intro_done'] === true,

  async execute(engine: VylosEventAPI, state: VylosGameState) {
    await engine.say('You unlock the door to your new apartment. Cardboard boxes everywhere.');
    await engine.say('A fresh start in a city you barely know. Exciting — and a little terrifying.');

    const name = await engine.choice([
      { text: 'Alex', value: 'Alex' },
      { text: 'Sam', value: 'Sam' },
      { text: 'Jordan', value: 'Jordan' },
    ]);

    state.player.name = name;
    await engine.say(`Right. You're ${name}. And today, this city becomes yours.`);
    await engine.say('The morning light fills the room. Time to settle in.');

    state.flags['intro_done'] = true;
    state.locationId = 'apartment';
    state.gameTime = 8;
  },
};

export default intro;
