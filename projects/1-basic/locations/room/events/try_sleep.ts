import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const trySleep: VylosEvent = {
  id: 'try_sleep',
  locationId: 'room',
  conditions: (state) => state.flags['try_sleep'] === true,
  async execute(engine: VylosAPI, state: BaseGameState) {
    state.flags['try_sleep'] = false;

    engine.setBackground('/assets/locations/room/room_night.png');

    await engine.say('You lie down on your bed and close your eyes.');
    await engine.say('...');
    await engine.say('You wake up feeling refreshed and ready for a new day!');

    // Advance to next day 7:00
    const hour = state.gameTime % 24;
    if (hour >= 21) {
      state.gameTime += (24 - hour) + 7;
    } else {
      state.gameTime += 7 - hour;
    }
  },
};

export default trySleep;
