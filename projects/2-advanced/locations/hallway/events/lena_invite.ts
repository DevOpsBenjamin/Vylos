import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import t from 'vylos:texts/hallway/lena_invite';

const lenaInvite: VylosEvent<GameState> = {
  id: 'lena_invite',
  locationId: 'hallway',
  conditions: (state) => state.characters.maya.affection >= 30 && state.characters.lena.affection >= 30 && !state.characters.lena.invited,
  locked: (state) => state.characters.lena.invited,

  async execute(engine: VylosEventAPI, state: GameState) {
    const { lena } = state.characters;

    engine.setBackground('/assets/locations/hallway/hallway.png');
    await engine.say(t.call);

    engine.setForeground('/assets/locations/hallway/lena.png');
    await engine.say(t.plans, { from: lena });
    await engine.say(t.doorframe);
    await engine.say(t.dinner, { from: lena });

    const pick = await engine.choice([
      { text: t.choice_yes, value: 'yes' },
      { text: t.choice_no, value: 'no' },
    ]);

    if (pick === 'yes') {
      await engine.say(t.yes_reply, { from: lena });
      lena.invited = true;
      lena.affection = Math.min(100, lena.affection + 10);
    } else {
      await engine.say(t.no_reply, { from: lena });
    }

    engine.setForeground(null);
  },
};

export default lenaInvite;
