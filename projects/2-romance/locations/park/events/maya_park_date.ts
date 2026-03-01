import type { VylosEvent, VylosAPI, VylosGameState } from '@vylos/core';
import { maya } from '@game';

const mayaParkDate: VylosEvent = {
  id: 'maya_park_date',
  locationId: 'park',

  conditions(state: VylosGameState) {
    return state.flags['maya_date_1'] === true && !state.flags['maya_park_done'];
  },

  locked: (state) => state.flags['maya_park_done'] === true,

  async execute(engine: VylosAPI, state: VylosGameState) {
    engine.setBackground('/assets/locations/park/park_sunset.jpg');
    engine.setForeground('/assets/locations/park/maya_casual.png');

    await engine.say('Maya walks beside you along the river path, jacket over her arm, shoulders finally relaxed.');
    await engine.say('The sunset turns everything gold. She tilts her face toward the light and closes her eyes for a moment.');
    await engine.say('"I used to want to travel. Open a cafe in Portugal or somewhere ridiculous like that."', { from: maya });
    await engine.say(`"Now I'm not sure. Maybe what I want is already here and I just haven't found the right angle on it."`, { from: maya });
    await engine.say('She glances at you — quick, a little vulnerable.');

    const pick = await engine.choice([
      { text: 'Share your own dreams with her', value: 'share' },
      { text: 'Keep it light — joke about Portugal', value: 'light' },
    ]);

    if (pick === 'share') {
      await engine.say('You tell her what you came here chasing. The real version, not the polished one.');
      await engine.say('She listens. Actually listens — not waiting for her turn, just... present.');
      await engine.say(`"That's the most honest thing anyone's said to me in a long time."`, { from: maya });
      await engine.say('She bumps your shoulder gently. The river keeps moving beneath you both.');
      (state as any).npcs.maya.affection = Math.min(100, ((state as any).npcs.maya.affection ?? 0) + 20);
    } else {
      await engine.say('"Portugal has good tiles," you offer. "Terrible for espresso quality control though."');
      await engine.say('She snorts — caught off guard — then laughs properly, leaning into your arm for a second.', { from: maya });
      await engine.say(`"You're a terrible person," she says, grinning. "I mean that fondly."`, { from: maya });
      (state as any).npcs.maya.affection = Math.min(100, ((state as any).npcs.maya.affection ?? 0) + 10);
    }

    engine.setForeground(null);
    state.flags['maya_park_done'] = true;
    (state as any).npcs.maya.dates = ((state as any).npcs.maya.dates ?? 0) + 1;
    state.gameTime += 2;
  },
};

export default mayaParkDate;
