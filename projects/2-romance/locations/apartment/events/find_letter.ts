import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const findLetter: VylosEvent = {
  id: 'find_letter',
  locationId: 'apartment',

  conditions(state: BaseGameState) {
    return (state as any).day === 1
      && state.flags['woke_up'] === true
      && !state.flags['found_letter'];
  },

  async execute(engine: VylosAPI, state: BaseGameState) {
    await engine.say(`As you're getting ready to head out, something catches your eye by the door.`);
    await engine.say('A small envelope, slipped under the gap. No stamp — handwritten, warm cursive.');
    await engine.say(`"Welcome to the building! I'm in 4B if you ever need anything. — Lena"`);
    await engine.say('You smile. Someone actually took the time to write a note. Old-fashioned and charming.');
    await engine.say('You make a mental note to say hello in the hallway sometime.');

    state.flags['found_letter'] = true;
  },
};

export default findLetter;
