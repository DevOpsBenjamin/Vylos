import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';

const intro: VylosEvent<GameState> = {
  id: 'intro',
  conditions: (state) => !state.flags.introDone,
  //This make the event not being check for condition on all engine tick.
  //For big project it could make a difference in performance, but for this small project it's not really needed.
  locked: (state) => state.flags.introDone,
  async execute(engine: VylosEventAPI, state: GameState) {
    engine.setForeground('assets/locations/hallway/hallway.png');
    state.flags.introDone = true;

    // You can store a reference to avoid repeating the full path each time.
    const narrator = state.characters.narrator;

    await engine.say('Welcome! Press Space or click the right side of the screen to advance.', { from: narrator });
    await engine.say('Vylos is a modern visual novel engine built for sandbox-style, interactive games.');
    await engine.say('For purely linear fiction, tools like SugarCube work well — but for explorative, choice-driven gameplay, Vylos offers more flexibility.');
    await engine.say('The engine is still in early development, yet it already makes building interactive experiences easier than older alternatives.');
    await engine.say('Vylos ships with a modern default UI and lets you override any component using Vue.');
    await engine.say('This template is a simple starter demo. Check out the GitHub page for a more complete example.', { from: narrator });
    await engine.say('Before we begin — what is your name?', { from: narrator });

    const name = await engine.choice([
      { text: '1 — Alex', value: 'Alex' },
      { text: '2 — Sam', value: 'Sam' },
      { text: '3 — Jordan', value: 'Jordan' },
    ]);
    state.player.name = name;

    await engine.say(`Nice to meet you, ${name}. That was your first choice!`, { from: narrator });
    await engine.say('Did you notice the numbers before each option? You can select a choice by pressing the corresponding number key.');
    await engine.say('Missed that? Try pressing the Left Arrow key to go back and redo the choice.');
    await engine.say('While inside an event, Left and Right Arrow keys let you browse through dialogue history. A small arrow at the bottom of the dialogue box shows when you are in history mode.');
    await engine.say('You can also use Q and E instead of the arrow keys if you prefer keeping your hand on the left side of the keyboard.');
    await engine.say('The UI can be toggled with H — press it now to try hiding and showing the interface.');
    await engine.say('That covers the basics. Time to start the game!', { from: narrator });
    await engine.say('[ Insert a deeply moving and passionate backstory here. ]');
    await engine.say('You wake up in your apartment. The morning light filters through the curtains.', { from: narrator });
  },
};

export default intro;
