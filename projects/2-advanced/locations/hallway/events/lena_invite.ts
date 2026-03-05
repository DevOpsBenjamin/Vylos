import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';
import { lena } from '@game';
import type { AdvancedGameState } from '@game/gameDatas/gameState';
import { getAffection, modAffection } from '@game/helpers/relationships';

const lenaInvite: VylosEvent = {
  id: 'lena_invite',
  locationId: 'hallway',

  conditions(state: VylosGameState) {
    const s = state as AdvancedGameState;
    return getAffection(s, 'maya') >= 30 && getAffection(s, 'lena') >= 30 && !s.flags['lena_invited'];
  },

  locked: (state) => state.flags['lena_invited'] === true,

  async execute(engine: VylosEventAPI, _state: VylosGameState) {
    const state = _state as AdvancedGameState;

    engine.setBackground('/assets/locations/hallway/hallway.png');
    await engine.say(`You're halfway out the door when you hear your name from down the hall.`);

    engine.setForeground('/assets/locations/hallway/lena.png');
    await engine.say('"Hey! Do you have plans this week?"', { from: lena });
    await engine.say(`She's leaning against her doorframe, apron still on, paint-stained fingers curled around a mug.`);
    await engine.say('"I make dinner on Thursdays. Nothing fancy — just good food and better company. You should come."', { from: lena });

    const pick = await engine.choice([
      { text: `"I'd love to."`, value: 'yes' },
      { text: '"Maybe another time..."', value: 'no' },
    ]);

    if (pick === 'yes') {
      await engine.say('"Perfect." She grins, warm and a little pleased. "Thursday it is."', { from: lena });
      state.flags['lena_invited'] = true;
      modAffection(state, 'lena', 10);
    } else {
      await engine.say('"No worries. The invitation stands." She shrugs, easy and gracious about it.', { from: lena });
    }

    engine.setForeground(null);
  },
};

export default lenaInvite;
