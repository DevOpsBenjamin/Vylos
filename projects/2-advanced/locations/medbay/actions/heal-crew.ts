import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import t from 'vylos:texts/medbay/actions';

const healCrew = {
  id: 'heal_crew',
  locationId: 'medbay',
  label: t.healCrew,

  unlocked(state: GameState) {
    const { elena, jax, kael } = state.crews;
    return elena.status === 'injured' || jax.status === 'injured' || kael.status === 'injured';
  },

  execute(_engine: VylosActionAPI, state: GameState) {
    const members = [state.crews.elena, state.crews.jax, state.crews.kael];
    const injured = members.find((m) => m.status === 'injured');
    if (injured) {
      injured.status = 'idle';
    }
  },
} satisfies VylosAction<GameState>;

export default healCrew;
