import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameState';
import { addJournalEntry } from '@game/helpers/journal';

const meetLena: VylosEvent = {
  id: 'meet_lena',
  locationId: 'hallway',

  conditions(state: VylosGameState) {
    const s = state as AdvancedGameState;
    return s.flags.foundLetter && !s.characters.lena.met;
  },

  locked: (state) => (state as AdvancedGameState).characters.lena.met,

  async execute(engine: VylosEventAPI, _state: VylosGameState) {
    const state = _state as AdvancedGameState;
    const { lena } = state.characters;

    engine.setBackground('/assets/locations/hallway/hallway.png');
    await engine.say(`The hallway is narrow and warmly lit. You've barely stepped out when you hear a thud.`);
    await engine.say(`A paper bag has toppled from someone's arms — groceries scattered across the floor.`);

    engine.setForeground('/assets/locations/hallway/lena.png');
    await engine.say(`"Oh no, not the eggs..."`, { from: lena });
    await engine.say(`She's crouching to gather things up — dark hair falling over her face, cheeks flushed.`);

    const pick = await engine.choice([
      { text: 'Help her pick everything up', value: 'help' },
      { text: 'Just say hi and offer a smile', value: 'hi' },
    ]);

    if (pick === 'help') {
      await engine.say('You drop to one knee and start collecting oranges that have rolled to the wall.');
      await engine.say('"Oh! Thank you, really — I always carry too much at once."', { from: lena });
      await engine.say('She laughs softly, a little embarrassed, a little grateful.');
      await engine.say(`"I'm Lena, by the way. 4B. You must be the new neighbor."`, { from: lena });
      lena.affection = Math.min(100, lena.affection + 15);
    } else {
      await engine.say('You wave and offer your warmest smile. "Need any help?"');
      await engine.say(`"I've got it, but thanks! You're sweet."`, { from: lena });
      await engine.say('"Lena. 4B. Welcome to the building."', { from: lena });
      lena.affection = Math.min(100, lena.affection + 5);
    }

    engine.setForeground(null);
    await engine.say('You exchange a warm smile before she disappears behind her door.');

    lena.met = true;
    lena.known = true;

    addJournalEntry(state, 'met_lena', 'Met Lena', 'Bumped into the neighbor from 4B — Lena. She seems kind.');
  },
};

export default meetLena;
