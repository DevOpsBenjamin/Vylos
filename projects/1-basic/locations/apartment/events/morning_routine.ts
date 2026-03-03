import type { VylosEvent, VylosAPI, VylosGameState } from '@vylos/core';
import type { BasicGameState } from '@game/gameState';

const morningRoutine: VylosEvent = {
  id: 'morning_routine',
  locationId: 'apartment',

  conditions(state: VylosGameState) {
    return state.flags['intro_done'] === true && !state.flags['woke_up'];
  },

  locked: (state) => state.flags['woke_up'] === true,

  async execute(engine: VylosAPI, _state: VylosGameState) {
    const state = _state as BasicGameState;

    engine.setBackground('/assets/locations/apartment/apartment_day.png');
    await engine.say('The alarm buzzes. Morning light fills the room.');

    const pick = await engine.choice([
      { text: 'Quick shower — get moving', value: 'shower' },
      { text: 'Sleep in a little longer', value: 'sleep' },
    ]);

    if (pick === 'shower') {
      await engine.say('Cold water, clean clothes. You feel ready to face the day.');
    } else {
      await engine.say('Fifteen more minutes turn into forty-five. Oops.');
      state.energy = Math.min(100, state.energy + 15);
      state.gameTime += 1;
    }

    state.flags['woke_up'] = true;
    await engine.say('Alright. New day, new city. Time to explore.');
  },
};

export default morningRoutine;
