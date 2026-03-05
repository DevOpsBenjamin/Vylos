import type { VylosEvent, VylosEventAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { addJournalEntry } from '@game/helpers/journal';
import t from 'vylos:texts/apartment/morning_routine';

const morningRoutine: VylosEvent<GameState> = {
  id: 'morning_routine',
  locationId: 'apartment',
  conditions: (state) => state.flags.introDone && !state.flags.wokeUp,
  locked: (state) => state.flags.wokeUp,

  async execute(engine: VylosEventAPI, state: GameState) {
    engine.setBackground('/assets/locations/apartment/apartment_day.png');
    await engine.say(t.alarm);
    await engine.say(t.city_waking);

    const pick = await engine.choice([
      { text: t.choice_shower, value: 'shower' },
      { text: t.choice_sleep, value: 'sleep' },
    ]);

    if (pick === 'shower') {
      await engine.say(t.shower_result);
      state.player.charm = Math.min(100, state.player.charm + 5);
    } else {
      await engine.say(t.sleep_result);
      await engine.say(t.dragged_up);
      state.player.energy = Math.min(100, state.player.energy + 15);
      state.gameTime += 1;
    }

    state.flags.wokeUp = true;
    await engine.say(t.day_starts);

    addJournalEntry(state, 'first_morning', 'First Morning', 'Woke up in the new apartment. Time to explore the city.');
  },
};

export default morningRoutine;
