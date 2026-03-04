import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';

const explore: VylosEvent = {
  id: 'explore_hallway',
  locationId: 'hallway',

  conditions(state: VylosGameState) {
    return state.flags['intro_done'] === true && !state.flags['hallway_explored'];
  },

  locked: (state) => state.flags['hallway_explored'] === true,

  async execute(engine: VylosEventAPI, state: VylosGameState) {
    engine.setBackground('/assets/locations/hallway/hallway.png');
    await engine.say('The hallway is narrow and warmly lit. Doors line both sides.');
    await engine.say('Down the stairs, you can hear the faint clatter of a cafe.');

    state.flags['hallway_explored'] = true;
  },
};

export default explore;
