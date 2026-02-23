import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const mayaPoem: VylosEvent = {
  id: 'maya_poem',
  locationId: 'cafe',

  conditions(state: BaseGameState) {
    return (state as any).npcs?.maya?.affection >= 40 && !state.flags['maya_poem'];
  },

  async execute(engine: VylosAPI, state: BaseGameState) {
    engine.setBackground('/locations/cafe/assets/cafe_day.png');
    engine.setForeground('/locations/cafe/assets/maya.png');

    await engine.say('The afternoon crowd has thinned. Maya leans on the counter with a folded piece of paper.');
    await engine.say(`"Okay, don't laugh — I write sometimes. And I want an honest opinion."`, { from: 'Maya' });
    await engine.say(`She slides the page toward you. It's a poem about rainstorms and waiting for something unnamed.`);

    const pick = await engine.choice([
      { text: `"It's beautiful — raw and honest."`, value: 'beautiful' },
      { text: '"Interesting. Lots of imagery."', value: 'interesting' },
      { text: `"It's... not really my thing, honestly."`, value: 'notmine' },
    ]);

    if (pick === 'beautiful') {
      await engine.say('Her expression softens. Something in her eyes shifts — like a wall quietly coming down.', { from: 'Maya' });
      await engine.say(`"Thank you. I wasn't sure anyone would get it."`, { from: 'Maya' });
      (state as any).npcs.maya.affection = Math.min(100, ((state as any).npcs.maya.affection ?? 0) + 15);
    } else if (pick === 'interesting') {
      await engine.say(`"Imagery. Ha. That's a careful word."`, { from: 'Maya' });
      await engine.say(`She smiles, a little wry. "I'll take it."`, { from: 'Maya' });
      (state as any).npcs.maya.affection = Math.min(100, ((state as any).npcs.maya.affection ?? 0) + 5);
    } else {
      await engine.say('"Fair enough." She folds it back up, expression unreadable for a beat.', { from: 'Maya' });
      await engine.say('"I asked for honest."', { from: 'Maya' });
      (state as any).npcs.maya.affection = Math.max(0, ((state as any).npcs.maya.affection ?? 0) - 5);
    }

    engine.setForeground(null);
    state.flags['maya_poem'] = true;
  },
};

export default mayaPoem;
