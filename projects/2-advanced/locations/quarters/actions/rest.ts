import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { BALANCE } from '@game/gameState/time';
import texts from 'vylos:texts';
const t = texts.quarters.actions;

const rest = {
  id: 'rest',
  locationId: 'quarters',
  label: t.rest,

  unlocked(state: GameState) {
    const { elena, jax, kael } = state.crews;
    return elena.stress > 0 || jax.stress > 0 || kael.stress > 0;
  },

  execute(_engine: VylosActionAPI, state: GameState) {
    const reduction = Math.abs(BALANCE.stressPerRest);
    const members = [state.crews.elena, state.crews.jax, state.crews.kael];
    for (const m of members) {
      m.stress = Math.max(0, m.stress - reduction);
    }
  },
} satisfies VylosAction<GameState>;

export default rest;
