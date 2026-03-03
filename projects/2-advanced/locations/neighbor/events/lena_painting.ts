import type { VylosEvent, VylosAPI, VylosGameState } from '@vylos/core';
import { lena } from '@game';
import type { AdvancedGameState } from '@game/gameDatas/gameState';
import { getAffection, modAffection } from '@game/helpers/relationships';

const lenaPainting: VylosEvent = {
  id: 'lena_painting',
  locationId: 'neighbor',

  conditions(state: VylosGameState) {
    const s = state as AdvancedGameState;
    return s.flags['dinner_done'] === true && getAffection(s, 'lena') >= 50 && !s.flags['lena_painting'];
  },

  async execute(engine: VylosAPI, _state: VylosGameState) {
    const state = _state as AdvancedGameState;

    engine.setBackground('/assets/locations/neighbor/lena_apartment.png');
    engine.setForeground('/assets/locations/neighbor/lena_artist.png');

    await engine.say('You find Lena surrounded by fresh canvases, a brush in her hand, a question in her eyes.');
    await engine.say(`"I've been thinking about a portrait series," she says carefully.`, { from: lena });
    await engine.say('"Real people. Real faces. No posing, no performance — just... someone sitting still with me for a while."', { from: lena });
    await engine.say('She turns to look at you properly. The question is quiet but unmistakable.');
    await engine.say('"Would you sit for me?"', { from: lena });

    const pick = await engine.choice([
      { text: `"Yes. I'd like that."`, value: 'agree' },
      { text: `"I don't think I'm ready for that."`, value: 'decline' },
    ]);

    if (pick === 'agree') {
      await engine.say(`Something in her expression settles — like she'd been holding her breath.`);
      await engine.say('"Good." She pulls over a chair, positions it in the light by the window.', { from: lena });
      await engine.say('You sit. She studies you — unhurried, careful, with the kind of attention that makes you feel both seen and safe.');
      await engine.say(`The afternoon passes in near-silence. It might be the most honest hour you've spent with anyone.`);
      modAffection(state, 'lena', 20);
      state.flags['lena_painting'] = true;
    } else {
      await engine.say(`"That's okay." She nods, and means it. "Another time, maybe."`, { from: lena });
      await engine.say('She turns back to her canvases. The offer stays gently open.');
      state.flags['lena_painting'] = false;
    }

    engine.setForeground(null);
    state.gameTime += 2;
  },
};

export default lenaPainting;
