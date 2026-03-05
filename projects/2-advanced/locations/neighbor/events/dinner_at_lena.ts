import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameState';
import { addJournalEntry } from '@game/helpers/journal';

const dinnerAtLena: VylosEvent = {
  id: 'dinner_at_lena',
  locationId: 'neighbor',

  conditions(state: VylosGameState) {
    const s = state as AdvancedGameState;
    return s.characters.lena.invited && !s.characters.lena.dinnerDone;
  },

  locked: (state) => (state as AdvancedGameState).characters.lena.dinnerDone,

  async execute(engine: VylosEventAPI, _state: VylosGameState) {
    const state = _state as AdvancedGameState;
    const { lena } = state.characters;

    engine.setBackground('/assets/locations/neighbor/lena_apartment.png');
    engine.setForeground('/assets/locations/neighbor/lena.png');

    await engine.say(`Lena's apartment smells like garlic, rosemary, and something with wine in it.`);
    await engine.say(`Canvases line the walls — unfinished, overlapping, all slightly wild. It's beautiful chaos.`);
    await engine.say(`"You came!" She says it like she wasn't entirely sure you would.`, { from: lena });
    await engine.say('She pours two glasses of red without asking and hands you one. The food is laid out simply and perfectly.');

    const pick = await engine.choice([
      { text: 'Ask about her art', value: 'art' },
      { text: 'Compliment the food', value: 'food' },
      { text: 'Flirt boldly — hold her gaze a beat too long', value: 'flirt' },
    ]);

    if (pick === 'art') {
      await engine.say(`"Oh — you noticed?" She lights up. Not performed delight. Genuine surprise.`, { from: lena });
      await engine.say(`"I paint what I can't say. Which means I paint a lot."`, { from: lena });
      await engine.say('You talk about the paintings for an hour. The wine disappears.');
      lena.affection = Math.min(100, lena.affection + 15);
    } else if (pick === 'food') {
      await engine.say(`"This is incredible — seriously. What's in the sauce?"`);
      await engine.say('"Wine, shallots, and a pinch of stubbornness."', { from: lena });
      await engine.say(`She's pleased — quietly, warmly pleased. You eat well and laugh more than you expected.`);
      lena.affection = Math.min(100, lena.affection + 10);
    } else if (state.charm >= 50) {
      await engine.say('You let the silence stretch half a second too long, holding her eyes with a soft smile.');
      await engine.say(`Color rises in her cheeks. She looks away first — but she's smiling.`, { from: lena });
      await engine.say(`"You're trouble," she says quietly, like it's not entirely a complaint.`, { from: lena });
      lena.affection = Math.min(100, lena.affection + 20);
    } else {
      await engine.say('You try your best but the moment lands slightly off — a beat too eager.');
      await engine.say('Lena smiles politely and refills your glass. The evening stays warm but measured.');
    }

    engine.setForeground(null);
    lena.dinnerDone = true;
    lena.dates += 1;
    state.gameTime += 3;

    addJournalEntry(state, 'dinner_lena', 'Dinner at Lena\'s', 'Had dinner at Lena\'s place. Her apartment is full of paintings.');
  },
};

export default dinnerAtLena;
