import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { system, unknown } from '@game';

/**
 * First conversation with the unknown number.
 * Placeholder for a deeper messaging system.
 */
const unknownChat: VylosEvent<GameState> = {
  id: 'unknown_chat',
  locationId: 'messages',

  conditions: (state) => state.flags['first_notif_done'] && !state.flags['unknown_chat_done'],

  locked: (state) => state.flags['unknown_chat_done'] === true,

  async execute(engine: VylosEventAPI, state: GameState) {
    await engine.say('You open the conversation with Unknown Number.', { from: system });

    await engine.say("So you found the phone.", { from: unknown });
    await engine.say("I was hoping someone curious would pick it up.", { from: unknown });

    const reply = await engine.choice([
      { text: 'Who are you?', value: 'who' },
      { text: 'What do you want?', value: 'what' },
      { text: 'I should call the police', value: 'police' },
    ]);

    if (reply === 'who') {
      await engine.say("Names don't matter. Not yet.", { from: unknown });
      await engine.say("What matters is what's on this phone.", { from: unknown });
    } else if (reply === 'what') {
      await engine.say("I want you to look. Really look.", { from: unknown });
      await engine.say("There are things here the previous owner hid.", { from: unknown });
    } else {
      await engine.say("Go ahead. They won't find anything.", { from: unknown });
      await engine.say("This phone doesn't exist in any database.", { from: unknown });
      await engine.say("But it exists for you. Right now.", { from: unknown });
    }

    await engine.say("Check the gallery when you're ready.", { from: unknown });
    await engine.say("And... be careful with the other apps.", { from: unknown });
    await engine.say("Not everything here is what it seems.", { from: unknown });

    state.flags['unknown_chat_done'] = true;
    state.story.mainQuestStep = 1;
  },
};

export default unknownChat;
