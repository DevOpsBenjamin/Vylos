import type { VylosEvent, VylosEventAPI, VylosGameState } from '@vylos/core';
import type { AdvancedGameState } from '@game/gameState';

const mayaDate: VylosEvent = {
  id: 'maya_date',
  locationId: 'cafe',

  conditions(state: VylosGameState) {
    const s = state as AdvancedGameState;
    return s.characters.maya.affection >= 60 && !s.characters.maya.date1;
  },

  locked: (state) => (state as AdvancedGameState).characters.maya.date1,

  async execute(engine: VylosEventAPI, _state: VylosGameState) {
    const state = _state as AdvancedGameState;
    const { maya } = state.characters;

    engine.setBackground('/assets/locations/cafe/cafe_day.png');
    engine.setForeground('/assets/locations/cafe/maya.png');

    await engine.say('Maya flips the "Open" sign to "Closed" and stretches her arms overhead.');
    await engine.say(`"I get off in twenty minutes and I'm dying to go somewhere that isn't here."`, { from: maya });
    await engine.say('She gives you a sideways look — casual, but her eyes are very much paying attention.', { from: maya });
    await engine.say('"The park by the river is nice at sunset. Feel like walking?"', { from: maya });

    const pick = await engine.choice([
      { text: `"Absolutely. I'll wait."`, value: 'yes' },
      { text: '"Not tonight — maybe another time."', value: 'no' },
    ]);

    if (pick === 'yes') {
      await engine.say('"Perfect." She smiles — unhurried, warm. "Give me a minute to grab my jacket."', { from: maya });
      maya.date1 = true;
      state.locationId = 'park';
      state.gameTime += 0.5;
    } else {
      await engine.say('"No rush." She shrugs, easy about it — but you catch the smallest flicker of disappointment.', { from: maya });
    }

    engine.setForeground(null);
  },
};

export default mayaDate;
