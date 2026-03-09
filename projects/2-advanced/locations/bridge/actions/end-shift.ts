import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { advanceTime, BALANCE } from '@game/gameState/time';
import texts from 'vylos:texts';
const t = texts.bridge.actions;

const endShift = {
  id: 'end_shift',
  locationId: 'bridge',
  label: t.endShift,

  execute(_engine: VylosActionAPI, state: GameState) {
    // Advance time by 1 tick
    advanceTime(state);

    // Apply resource consumption
    state.station.oxygen = Math.max(0, Math.min(100, state.station.oxygen + BALANCE.oxygenPerShift));
    state.station.energy = Math.max(0, Math.min(100, state.station.energy + BALANCE.energyPerShift));

    // Apply module degradation to each module
    const modules = state.station.modules;
    for (const key of Object.keys(modules) as Array<keyof typeof modules>) {
      const mod = modules[key];
      mod.integrity = Math.max(0, Math.min(100, mod.integrity + BALANCE.degradationPerShift));
      if (mod.integrity < 30) {
        mod.damaged = true;
      }
    }

    // Roll for solar flare — schedule for a future day if not already scheduled
    if (state.flags.solarFlareScheduledDay === 0 && Math.random() < 0.15) {
      state.flags.solarFlareScheduledDay = state.time.day + 1;
    }

    // Clamp materials just in case
    state.station.materials = Math.max(0, Math.min(50, state.station.materials));
  },
} satisfies VylosAction<GameState>;

export default endShift;
