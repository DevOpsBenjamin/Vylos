import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

/**
 * First conversation with the unknown number.
 * Placeholder for a deeper messaging system.
 */
const unknownChat: VylosEvent = {
  id: 'unknown_chat',
  locationId: 'messages',

  conditions: (state) => state.flags['first_notif_done'] && !state.flags['unknown_chat_done'],

  async execute(engine: VylosAPI, state: BaseGameState) {
    await engine.say('You open the conversation with Unknown Number.', { from: 'System' });

    await engine.say("So you found the phone.", { from: 'Unknown' });
    await engine.say("I was hoping someone curious would pick it up.", { from: 'Unknown' });

    const reply = await engine.choice([
      { text: 'Who are you?', value: 'who' },
      { text: 'What do you want?', value: 'what' },
      { text: 'I should call the police', value: 'police' },
    ]);

    if (reply === 'who') {
      await engine.say("Names don't matter. Not yet.", { from: 'Unknown' });
      await engine.say("What matters is what's on this phone.", { from: 'Unknown' });
    } else if (reply === 'what') {
      await engine.say("I want you to look. Really look.", { from: 'Unknown' });
      await engine.say("There are things here the previous owner hid.", { from: 'Unknown' });
    } else {
      await engine.say("Go ahead. They won't find anything.", { from: 'Unknown' });
      await engine.say("This phone doesn't exist in any database.", { from: 'Unknown' });
      await engine.say("But it exists for you. Right now.", { from: 'Unknown' });
    }

    await engine.say("Check the gallery when you're ready.", { from: 'Unknown' });
    await engine.say("And... be careful with the other apps.", { from: 'Unknown' });
    await engine.say("Not everything here is what it seems.", { from: 'Unknown' });

    state.flags['unknown_chat_done'] = true;
    (state as Record<string, unknown>).story = {
      ...((state as Record<string, unknown>).story as Record<string, unknown> || {}),
      mainQuestStep: 1,
    };
  },
};

export default unknownChat;
