import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { addJournalEntry } from '@game/helpers/journal';
import t from 'vylos:texts/apartment/find_letter';

const findLetter: VylosEvent<GameState> = {
  id: 'find_letter',
  locationId: 'apartment',
  conditions: (state) => state.player.day === 1 && state.flags.wokeUp && !state.flags.foundLetter,
  locked: (state) => state.flags.foundLetter,

  async execute(engine: VylosEventAPI, state: GameState) {
    await engine.say(t.spotted);
    await engine.say(t.envelope);
    await engine.say(t.content);
    await engine.say(t.reaction);
    await engine.say(t.mental_note);

    state.flags.foundLetter = true;

    addJournalEntry(state, 'lena_letter', "Lena's Letter", 'Found a handwritten welcome note from a neighbor in 4B.');
  },
};

export default findLetter;
