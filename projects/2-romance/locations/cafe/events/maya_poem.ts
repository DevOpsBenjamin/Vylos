import type { VylosEvent, VylosAPI, VylosGameState } from '@vylos/core';
import { maya } from '@game';

const mayaPoem: VylosEvent = {
  id: 'maya_poem',
  locationId: 'cafe',

  conditions(state: VylosGameState) {
    return (state as any).npcs?.maya?.affection >= 40 && !state.flags['maya_poem'];
  },

  locked: (state) => state.flags['maya_poem'] === true,

  async execute(engine: VylosAPI, state: VylosGameState) {
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
      (state as any).npcs.maya.affection = Math.min(100, ((state as any).npcs.maya.affection ?? 0) + 15);
    } else if (pick === 'interesting') {
      await engine.say(`"Imagery. Ha. That's a careful word."`, { from: maya });
      await engine.say(`She smiles, a little wry. "I'll take it."`, { from: maya });
      (state as any).npcs.maya.affection = Math.min(100, ((state as any).npcs.maya.affection ?? 0) + 5);
    } else {
      await engine.say('"Fair enough." She folds it back up, expression unreadable for a beat.', { from: maya });
      await engine.say('"I asked for honest."', { from: maya });
      (state as any).npcs.maya.affection = Math.max(0, ((state as any).npcs.maya.affection ?? 0) - 5);
    }

    engine.setForeground(null);
    state.flags['maya_poem'] = true;
  },
};

export default mayaPoem;
