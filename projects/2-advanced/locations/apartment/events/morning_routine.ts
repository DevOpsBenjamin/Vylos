import type { VylosEvent, VylosAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameDatas/gameState';
import { addJournalEntry } from '@game/helpers/journal';

const morningRoutine: VylosEvent = {
  id: 'morning_routine',
  locationId: 'apartment',

  conditions(state: VylosGameState) {
    return state.flags['intro_done'] === true && !state.flags['woke_up'];
  },

  locked: (state) => state.flags['woke_up'] === true,

  async execute(engine: VylosAPI, _state: VylosGameState) {
    const state = _state as AdvancedGameState;

    engine.setBackground('/assets/locations/apartment/apartment_day.png');
    await engine.say('The alarm buzzes. Pale morning light fills the room.');
    await engine.say('You lie there for a moment, listening to the city waking up outside.');

    const pick = await engine.choice([
      { text: 'Quick shower — get moving', value: 'shower' },
      { text: 'Sleep in a little longer', value: 'sleep' },
    ]);

    if (pick === 'shower') {
      await engine.say('Cold water, clean clothes, a flash of confidence in the mirror. Not bad.');
      state.charm = Math.min(100, state.charm + 5);
    } else {
      await engine.say('Just fifteen more minutes... which turns into forty-five. Oops.');
      await engine.say('You drag yourself up, a little groggy but oddly content.');
      state.energy = Math.min(100, state.energy + 15);
      state.gameTime += 1;
    }

    state.flags['woke_up'] = true;
    await engine.say('Alright. New day, new city. Time to explore.');

    addJournalEntry(state, 'first_morning', 'First Morning', 'Woke up in the new apartment. Time to explore the city.');
  },
};

export default morningRoutine;
