import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const explore: VylosEvent = {
  id: 'explore_hallway',
  locationId: 'hallway',
  conditions: (state) => state.flags['intro_done'] === true && !state.flags['hallway_explored'],
  async execute(engine: VylosAPI, state: BaseGameState) {
    engine.setBackground('/locations/hallway/assets/hallway.png');

    await engine.say('The hallway stretches ahead, dimly lit by overhead lights.');
    await engine.say('At the far end you can see a door leading outside.');

    const pick = await engine.choice([
      { text: 'Go outside', value: 'outside' },
      { text: 'Go back to your room', value: 'room' },
    ]);

    if (pick === 'outside') {
      await engine.say('You push through the door into the open air.');
      engine.setLocation('outside');
    } else {
      await engine.say('You turn around and head back to your room.');
      engine.setLocation('room');
    }

    state.flags['hallway_explored'] = true;
  },
};

export default explore;
