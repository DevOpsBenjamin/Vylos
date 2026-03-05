import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameState';

const mayaPoem: VylosEvent = {
  id: 'maya_poem',
  locationId: 'cafe',

  conditions(state: VylosGameState) {
    const s = state as AdvancedGameState;
    return s.characters.maya.affection >= 40 && !s.characters.maya.poem;
  },

  locked: (state) => (state as AdvancedGameState).characters.maya.poem,

  async execute(engine: VylosEventAPI, _state: VylosGameState) {
    const state = _state as AdvancedGameState;
    const { maya } = state.characters;

    engine.setBackground('/assets/locations/cafe/cafe_day.png');
    engine.setForeground('/assets/locations/cafe/maya.png');

    await engine.say('The afternoon crowd has thinned. Maya leans on the counter with a folded piece of paper.');
    await engine.say(`"Okay, don't laugh — I write sometimes. And I want an honest opinion."`, { from: maya });
    await engine.say(`She slides the page toward you. It's a poem about rainstorms and waiting for something unnamed.`);

    const pick = await engine.choice([
      { text: `"It's beautiful — raw and honest."`, value: 'beautiful' },
      { text: '"Interesting. Lots of imagery."', value: 'interesting' },
      { text: `"It's... not really my thing, honestly."`, value: 'notmine' },
    ]);

    if (pick === 'beautiful') {
      await engine.say('Her expression softens. Something in her eyes shifts — like a wall quietly coming down.', { from: maya });
      await engine.say(`"Thank you. I wasn't sure anyone would get it."`, { from: maya });
      maya.affection = Math.min(100, maya.affection + 15);
    } else if (pick === 'interesting') {
      await engine.say(`"Imagery. Ha. That's a careful word."`, { from: maya });
      await engine.say(`She smiles, a little wry. "I'll take it."`, { from: maya });
      maya.affection = Math.min(100, maya.affection + 5);
    } else {
      await engine.say('"Fair enough." She folds it back up, expression unreadable for a beat.', { from: maya });
      await engine.say('"I asked for honest."', { from: maya });
      maya.affection = Math.max(0, maya.affection - 5);
    }

    engine.setForeground(null);
    maya.poem = true;
  },
};

export default mayaPoem;
