import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameState';

const parkWalk: VylosEvent = {
  id: 'park_walk',
  locationId: 'park',

  conditions(state: VylosGameState) {
    return !(state as AdvancedGameState).flags.parkIntro;
  },

  locked: (state) => (state as AdvancedGameState).flags.parkIntro,

  async execute(engine: VylosEventAPI, _state: VylosGameState) {
    const state = _state as AdvancedGameState;

    engine.setBackground('/assets/locations/park/park_day.jpg');
    await engine.say(`Riverside Park stretches along the water's edge, wide and unhurried.`);
    await engine.say('Willow trees trail their fingers in the current. Couples stroll. Pigeons argue over bread.');
    await engine.say(`It's the kind of place that makes you slow down without meaning to.`);
    await engine.say('You stand at the railing and watch the river move. The city feels far away from here.');

    state.flags.parkIntro = true;
  },
};

export default parkWalk;
