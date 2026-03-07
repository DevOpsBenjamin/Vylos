import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import t from 'vylos:texts/neighbor/lena_painting';

const lenaPainting: VylosEvent<GameState> = {
  id: 'lena_painting',
  locationId: 'neighbor',
  conditions: (state) => state.characters.lena.dinnerDone && state.characters.lena.affection >= 50 && !state.characters.lena.painting,

  async execute(engine: VylosEventAPI, state: GameState) {
    const { lena } = state.characters;

    engine.setBackground('/assets/locations/neighbor/lena_apartment.png');
    engine.setForeground('/assets/locations/neighbor/lena_artist.png');

    await engine.say(t.scene);
    await engine.say(t.portrait, { from: lena });
    await engine.say(t.real, { from: lena });
    await engine.say(t.look);
    await engine.say(t.ask, { from: lena });

    const pick = await engine.choice([
      { text: t.choice_agree, value: 'agree' },
      { text: t.choice_decline, value: 'decline' },
    ]);

    if (pick === 'agree') {
      await engine.say(t.agree_settle);
      await engine.say(t.agree_chair, { from: lena });
      await engine.say(t.agree_study);
      await engine.say(t.agree_afternoon);
      lena.affection = Math.min(100, lena.affection + 20);
      lena.painting = true;
    } else {
      await engine.say(t.decline_1, { from: lena });
      await engine.say(t.decline_2);
    }

    engine.setForeground(null);
    state.gameTime += 2;
  },
};

export default lenaPainting;
