import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const dinnerAtLena: VylosEvent = {
  id: 'dinner_at_lena',
  locationId: 'neighbor',

  conditions(state: BaseGameState) {
    return state.flags['lena_invited'] === true && !state.flags['dinner_done'];
  },

  async execute(engine: VylosAPI, state: BaseGameState) {
    engine.setBackground('/locations/neighbor/assets/lena_apartment.png');
    engine.setForeground('/locations/neighbor/assets/lena.png');

    await engine.say(`Lena's apartment smells like garlic, rosemary, and something with wine in it.`);
    await engine.say(`Canvases line the walls — unfinished, overlapping, all slightly wild. It's beautiful chaos.`);
    await engine.say(`"You came!" She says it like she wasn't entirely sure you would.`, { from: 'Lena' });
    await engine.say('She pours two glasses of red without asking and hands you one. The food is laid out simply and perfectly.');

    const pick = await engine.choice([
      { text: 'Ask about her art', value: 'art' },
      { text: 'Compliment the food', value: 'food' },
      { text: 'Flirt boldly — hold her gaze a beat too long', value: 'flirt' },
    ]);

    const charm = (state as any).charm ?? 20;

    if (pick === 'art') {
      await engine.say(`"Oh — you noticed?" She lights up. Not performed delight. Genuine surprise.`, { from: 'Lena' });
      await engine.say(`"I paint what I can't say. Which means I paint a lot."`, { from: 'Lena' });
      await engine.say('You talk about the paintings for an hour. The wine disappears.');
      (state as any).npcs.lena.affection = Math.min(100, ((state as any).npcs.lena.affection ?? 0) + 15);
    } else if (pick === 'food') {
      await engine.say(`"This is incredible — seriously. What's in the sauce?"`);
      await engine.say('"Wine, shallots, and a pinch of stubbornness."', { from: 'Lena' });
      await engine.say(`She's pleased — quietly, warmly pleased. You eat well and laugh more than you expected.`);
      (state as any).npcs.lena.affection = Math.min(100, ((state as any).npcs.lena.affection ?? 0) + 10);
    } else if (charm >= 50) {
      await engine.say('You let the silence stretch half a second too long, holding her eyes with a soft smile.');
      await engine.say(`Color rises in her cheeks. She looks away first — but she's smiling.`, { from: 'Lena' });
      await engine.say(`"You're trouble," she says quietly, like it's not entirely a complaint.`, { from: 'Lena' });
      (state as any).npcs.lena.affection = Math.min(100, ((state as any).npcs.lena.affection ?? 0) + 20);
    } else {
      await engine.say('You try your best but the moment lands slightly off — a beat too eager.');
      await engine.say('Lena smiles politely and refills your glass. The evening stays warm but measured.');
    }

    engine.setForeground(null);
    state.flags['dinner_done'] = true;
    (state as any).npcs.lena.dates = ((state as any).npcs.lena.dates ?? 0) + 1;
    state.gameTime += 3;
  },
};

export default dinnerAtLena;
