import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const parkWalk: VylosEvent = {
  id: 'park_walk',
  locationId: 'park',

  conditions(state: BaseGameState) {
    return !state.flags['park_intro'];
  },

  async execute(engine: VylosAPI, state: BaseGameState) {
    engine.setBackground('/locations/park/assets/park_day.jpg');
    await engine.say(`Riverside Park stretches along the water's edge, wide and unhurried.`);
    await engine.say('Willow trees trail their fingers in the current. Couples stroll. Pigeons argue over bread.');
    await engine.say(`It's the kind of place that makes you slow down without meaning to.`);
    await engine.say('You stand at the railing and watch the river move. The city feels far away from here.');

    state.flags['park_intro'] = true;
  },
};

export default parkWalk;
