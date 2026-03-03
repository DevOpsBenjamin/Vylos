import type { VylosEvent, VylosAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameDatas/gameState';
import { addJournalEntry } from '@game/helpers/journal';

const findLetter: VylosEvent = {
  id: 'find_letter',
  locationId: 'apartment',

  conditions(state: VylosGameState) {
    const s = state as AdvancedGameState;
    return s.day === 1 && s.flags['woke_up'] === true && !s.flags['found_letter'];
  },

  locked: (state) => state.flags['found_letter'] === true,

  async execute(engine: VylosAPI, _state: VylosGameState) {
    const state = _state as AdvancedGameState;

    await engine.say(`As you're getting ready to head out, something catches your eye by the door.`);
    await engine.say('A small envelope, slipped under the gap. No stamp — handwritten, warm cursive.');
    await engine.say(`"Welcome to the building! I'm in 4B if you ever need anything. — Lena"`);
    await engine.say('You smile. Someone actually took the time to write a note. Old-fashioned and charming.');
    await engine.say('You make a mental note to say hello in the hallway sometime.');

    state.flags['found_letter'] = true;

    addJournalEntry(state, 'lena_letter', "Lena's Letter", 'Found a handwritten welcome note from a neighbor in 4B.');
  },
};

export default findLetter;
