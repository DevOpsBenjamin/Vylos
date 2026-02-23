import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const lenaPainting: VylosEvent = {
  id: 'lena_painting',
  locationId: 'neighbor',

  conditions(state: BaseGameState) {
    return state.flags['dinner_done'] === true
      && (state as any).npcs?.lena?.affection >= 50
      && !state.flags['lena_painting'];
  },

  async execute(engine: VylosAPI, state: BaseGameState) {
    engine.setBackground('/locations/neighbor/assets/lena_apartment.png');
    engine.setForeground('/locations/neighbor/assets/lena_artist.png');

    await engine.say('You find Lena surrounded by fresh canvases, a brush in her hand, a question in her eyes.');
    await engine.say(`"I've been thinking about a portrait series," she says carefully.`, { from: 'Lena' });
    await engine.say('"Real people. Real faces. No posing, no performance — just... someone sitting still with me for a while."', { from: 'Lena' });
    await engine.say('She turns to look at you properly. The question is quiet but unmistakable.');
    await engine.say('"Would you sit for me?"', { from: 'Lena' });

    const pick = await engine.choice([
      { text: `"Yes. I'd like that."`, value: 'agree' },
      { text: `"I don't think I'm ready for that."`, value: 'decline' },
    ]);

    if (pick === 'agree') {
      await engine.say(`Something in her expression settles — like she'd been holding her breath.`);
      await engine.say('"Good." She pulls over a chair, positions it in the light by the window.', { from: 'Lena' });
      await engine.say('You sit. She studies you — unhurried, careful, with the kind of attention that makes you feel both seen and safe.');
      await engine.say(`The afternoon passes in near-silence. It might be the most honest hour you've spent with anyone.`);
      (state as any).npcs.lena.affection = Math.min(100, ((state as any).npcs.lena.affection ?? 0) + 20);
      state.flags['lena_painting'] = true;
    } else {
      await engine.say(`"That's okay." She nods, and means it. "Another time, maybe."`, { from: 'Lena' });
      await engine.say('She turns back to her canvases. The offer stays gently open.');
      state.flags['lena_painting'] = false;
    }

    engine.setForeground(null);
    state.gameTime += 2;
  },
};

export default lenaPainting;
