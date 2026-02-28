import type { VylosEvent, VylosAPI } from '@vylos/core';
import type { GameState } from '@game';
import { narrator } from '@game';

const intro: VylosEvent<GameState> = {
  id: 'intro',
  conditions: (state) => !state.flags['intro_done'],
  async execute(engine: VylosAPI, state: GameState) {
    await engine.say('Welcome to your Vylos game!', { from: narrator });
    await engine.say('This is a starter template. Edit the events to build your story.');

    const pick = await engine.choice([
      { text: 'Sounds good!', value: 'ok' },
      { text: 'Tell me more', value: 'more' },
    ]);

    if (pick === 'more') {
      await engine.say('Events pause at each say() and choice() call.');
      await engine.say('Add locations, backgrounds, and characters to bring your story to life.');
    }

    await engine.say('Your adventure begins here. Good luck!');
    state.flags['intro_done'] = true;
  },
};

export default intro;
