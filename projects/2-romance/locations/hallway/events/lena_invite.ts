import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const lenaInvite: VylosEvent = {
  id: 'lena_invite',
  locationId: 'hallway',

  conditions(state: BaseGameState) {
    return (state as any).npcs?.maya?.affection >= 30
      && (state as any).npcs?.lena?.affection >= 30
      && !state.flags['lena_invited'];
  },

  async execute(engine: VylosAPI, state: BaseGameState) {
    engine.setBackground('/locations/hallway/assets/hallway.png');
    await engine.say(`You're halfway out the door when you hear your name from down the hall.`);

    engine.setForeground('/locations/hallway/assets/lena.png');
    await engine.say('"Hey! Do you have plans this week?"', { from: 'Lena' });
    await engine.say(`She's leaning against her doorframe, apron still on, paint-stained fingers curled around a mug.`);
    await engine.say('"I make dinner on Thursdays. Nothing fancy — just good food and better company. You should come."', { from: 'Lena' });

    const pick = await engine.choice([
      { text: `"I'd love to."`, value: 'yes' },
      { text: '"Maybe another time..."', value: 'no' },
    ]);

    if (pick === 'yes') {
      await engine.say('"Perfect." She grins, warm and a little pleased. "Thursday it is."', { from: 'Lena' });
      state.flags['lena_invited'] = true;
      (state as any).npcs.lena.affection = Math.min(100, ((state as any).npcs.lena.affection ?? 0) + 10);
    } else {
      await engine.say('"No worries. The invitation stands." She shrugs, easy and gracious about it.', { from: 'Lena' });
    }

    engine.setForeground(null);
  },
};

export default lenaInvite;
