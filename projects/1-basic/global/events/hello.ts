import type { VylosEvent, VylosAPI, VylosGameState } from '@vylos/core';
import { system } from '@game';

const intro: VylosEvent = {
  id: 'intro',
  conditions: (state) => !state.flags['intro_done'],
  async execute(engine: VylosAPI, state: VylosGameState) {
    engine.setBackground('/assets/locations/room/room_day.png');

    await engine.say('Welcome to the Vylos Engine demo!');

    const pick = await engine.choice([
      { text: 'Start the adventure', value: 'start' },
      { text: 'Learn more about Vylos', value: 'learn' },
    ]);

    if (pick === 'learn') {
      await engine.say('Vylos is a TypeScript visual novel engine built with Vue 3.');
      await engine.say('It supports backgrounds, choices, locations, actions, and save/load.');

      await engine.say('Backgrounds change with the time of day. Right now it\'s daytime — use "Wait 1 Hour" to advance time past 20h and see the night version.', { from: system });
      await engine.say('Locations are linked together. You\'ll see circles at the bottom-right to travel: Room ↔ Hallway ↔ Outside.', { from: system });
      await engine.say('Actions appear at the bottom-left. Some are always available, others unlock based on conditions (like "Rest" only at night).', { from: system });

      const keys = await engine.choice([
        { text: 'Got it, let\'s go!', value: 'start' },
        { text: 'Tell me about controls', value: 'keys' },
      ]);

      if (keys === 'keys') {
        await engine.say('Space / Enter / Click — advance dialogue.', { from: system });
        await engine.say('Arrow Left / Right — navigate text history.', { from: system });
        await engine.say('Escape — pause menu (save, load, settings).', { from: system });
        await engine.say('Hold Ctrl — skip text quickly (stops at choices).', { from: system });
      }
    }

    await engine.say('You wake up in your room. Time to explore!');
    state.flags['intro_done'] = true;
  },
};

export default intro;
