import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const morningRoutine: VylosEvent = {
  id: 'morning_routine',
  locationId: 'apartment',

  conditions(state: BaseGameState) {
    return state.flags['intro_done'] === true && !state.flags['woke_up'];
  },

  async execute(engine: VylosAPI, state: BaseGameState) {
    engine.setBackground('/assets/locations/apartment/apartment_day.png');
    await engine.say('The alarm buzzes. Pale morning light fills the room.');
    await engine.say('You lie there for a moment, listening to the city waking up outside.');

    const pick = await engine.choice([
      { text: 'Quick shower — get moving', value: 'shower' },
      { text: 'Sleep in a little longer', value: 'sleep' },
    ]);

    if (pick === 'shower') {
      await engine.say('Cold water, clean clothes, a flash of confidence in the mirror. Not bad.');
      (state as any).charm = Math.min(100, ((state as any).charm ?? 20) + 5);
    } else {
      await engine.say('Just fifteen more minutes... which turns into forty-five. Oops.');
      await engine.say('You drag yourself up, a little groggy but oddly content.');
      (state as any).energy = Math.min(100, ((state as any).energy ?? 100) + 15);
      state.gameTime += 1;
    }

    state.flags['woke_up'] = true;
    await engine.say('Alright. New day, new city. Time to explore.');
  },
};

export default morningRoutine;
