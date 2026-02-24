import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

/**
 * Boot sequence — the phone turns on for the first time.
 * Sets up the initial state and introduces the concept.
 */
const boot: VylosEvent = {
  id: 'boot',

  conditions: (state) => !state.flags['booted'],

  async execute(engine: VylosAPI, state: BaseGameState) {
    await engine.say('...');
    await engine.say('The screen flickers to life.');
    await engine.say('Welcome to LifeOS v1.0');
    await engine.say('This phone was found at a bus stop. No owner ID. No lock code.');

    const pick = await engine.choice([
      { text: 'Keep the phone', value: 'keep' },
      { text: 'Try to find the owner', value: 'find' },
    ]);

    if (pick === 'keep') {
      await engine.say('Finders keepers, right?');
      await engine.say('The phone hums softly. It feels... warm.');
    } else {
      await engine.say('You look around. Nobody in sight.');
      await engine.say('Maybe there are clues in the phone itself...');
      state.flags['looking_for_owner'] = true;
    }

    await engine.say('You notice a new notification.');
    await engine.say(`[Messages] Unknown Number: "Don't turn it off."`);

    state.flags['booted'] = true;
    state.flags['has_mysterious_message'] = true;
  },
};

export default boot;
