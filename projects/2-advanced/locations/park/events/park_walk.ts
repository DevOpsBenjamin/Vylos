import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import t from 'vylos:texts/park/park_walk';

const parkWalk: VylosEvent<GameState> = {
  id: 'park_walk',
  locationId: 'park',
  conditions: (state) => !state.flags.parkIntro,
  locked: (state) => state.flags.parkIntro,

  async execute(engine: VylosEventAPI, state: GameState) {
    engine.setBackground('/assets/locations/park/park_day.jpg');
    await engine.say(t.enter);
    await engine.say(t.willows);
    await engine.say(t.slow);
    await engine.say(t.railing);

    state.flags.parkIntro = true;
  },
};

export default parkWalk;
