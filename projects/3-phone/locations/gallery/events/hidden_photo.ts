import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { system } from '@game';

/**
 * Discover a hidden photo in the gallery — deepens the mystery.
 * Placeholder for a more complex gallery mechanic.
 */
const hiddenPhoto: VylosEvent<GameState> = {
  id: 'hidden_photo',
  locationId: 'gallery',

  conditions: (state) => state.flags.galleryHint && !state.flags.foundPhoto,

  locked: (state) => state.flags.foundPhoto,

  async execute(engine: VylosEventAPI, state: GameState) {
    await engine.say('You scroll through the gallery...', { from: system });
    await engine.say('Mostly generic wallpapers and stock photos.');
    await engine.say('But then you notice something.');
    await engine.say('A photo that looks different. It has a timestamp from three days ago.');
    await engine.say('It shows a handwritten note on a napkin:');
    await engine.say('"IF YOU FOUND THIS PHONE, DO NOT DELETE THIS APP."');

    const pick = await engine.choice([
      { text: 'Look for more hidden photos', value: 'search' },
      { text: 'Go back to messages', value: 'messages' },
    ]);

    if (pick === 'search') {
      await engine.say('You search carefully through every album...');
      await engine.say('Nothing else stands out. For now.');
      state.flags.thoroughSearcher = true;
    }

    state.flags.foundPhoto = true;
    await engine.say('Your phone buzzes. New message from Unknown.');
    state.flags.photoReactionPending = true;
  },
};

export default hiddenPhoto;
