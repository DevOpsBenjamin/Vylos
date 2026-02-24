import type { VylosEvent, VylosAPI, BaseGameState } from '@vylos/core';

const meetLena: VylosEvent = {
  id: 'meet_lena',
  locationId: 'hallway',

  conditions(state: BaseGameState) {
    return state.flags['found_letter'] === true && !state.flags['met_lena'];
  },

  async execute(engine: VylosAPI, state: BaseGameState) {
    engine.setBackground('/assets/locations/hallway/hallway.png');
    await engine.say(`The hallway is narrow and warmly lit. You've barely stepped out when you hear a thud.`);
    await engine.say(`A paper bag has toppled from someone's arms — groceries scattered across the floor.`);

    engine.setForeground('/assets/locations/hallway/lena.png');
    await engine.say(`"Oh no, not the eggs..."`, { from: 'Lena' });
    await engine.say(`She's crouching to gather things up — dark hair falling over her face, cheeks flushed.`);

    const pick = await engine.choice([
      { text: 'Help her pick everything up', value: 'help' },
      { text: 'Just say hi and offer a smile', value: 'hi' },
    ]);

    if (pick === 'help') {
      await engine.say('You drop to one knee and start collecting oranges that have rolled to the wall.');
      await engine.say('"Oh! Thank you, really — I always carry too much at once."', { from: 'Lena' });
      await engine.say('She laughs softly, a little embarrassed, a little grateful.');
      await engine.say(`"I'm Lena, by the way. 4B. You must be the new neighbor."`, { from: 'Lena' });
      (state as any).npcs.lena.affection = ((state as any).npcs.lena.affection ?? 0) + 15;
    } else {
      await engine.say('You wave and offer your warmest smile. "Need any help?"');
      await engine.say(`"I've got it, but thanks! You're sweet."`, { from: 'Lena' });
      await engine.say('"Lena. 4B. Welcome to the building."', { from: 'Lena' });
      (state as any).npcs.lena.affection = ((state as any).npcs.lena.affection ?? 0) + 5;
    }

    engine.setForeground(null);
    await engine.say('You exchange a warm smile before she disappears behind her door.');

    state.flags['met_lena'] = true;
    state.flags['knows_lena'] = true;
    (state as any).npcs.lena.met = true;
  },
};

export default meetLena;
