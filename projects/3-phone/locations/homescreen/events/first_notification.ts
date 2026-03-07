import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

/**
 * First real notification after boot — draws player into the mystery.
 */
const firstNotification: VylosEvent<GameState> = {
  id: 'first_notification',
  locationId: 'homescreen',

  conditions: (state) => state.flags.booted && !state.flags.firstNotifDone,

  locked: (state) => state.flags.firstNotifDone,

  async execute(engine: VylosEventAPI, state: GameState) {
    await engine.say('The phone buzzes.');
    await engine.say('[Messages] Unknown: "I know you can see this."');
    await engine.say('[Messages] Unknown: "The previous owner left something for you."');
    await engine.say('[Messages] Unknown: "Check the gallery."');

    const pick = await engine.choice([
      { text: 'Open Messages', value: 'messages' },
      { text: 'Open Gallery', value: 'gallery' },
      { text: 'Ignore it', value: 'ignore' },
    ]);

    if (pick === 'ignore') {
      await engine.say('You try to ignore it, but the phone buzzes again.');
      await engine.say(`[Messages] Unknown: "You can't ignore me. I'm in the phone."`);
    }

    state.flags.firstNotifDone = true;
    state.flags.galleryHint = true;
  },
};

export default firstNotification;
