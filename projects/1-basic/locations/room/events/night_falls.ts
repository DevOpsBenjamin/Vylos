import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const nightFalls: VylosEvent = {
  id: 'night_falls',
  locationId: 'room',
  conditions: (state) => state.flags['intro_done'] === true && !state.flags['night_seen'] && state.gameTime >= 20,
  async execute(engine: VylosAPI, state: BaseGameState) {
    engine.setBackground('/assets/locations/room/room_night.png');

    await engine.say('The sun has set. Your room is bathed in moonlight.');
    await engine.say('Notice how the background changed? The engine switches backgrounds based on game time.');
    await engine.say('Try resting to advance time and see the cycle continue.');

    state.flags['night_seen'] = true;
  },
};

export default nightFalls;
