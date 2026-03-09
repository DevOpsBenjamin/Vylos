import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import t from 'vylos:texts/airlock/actions';

const evaMission = {
  id: 'eva_mission',
  locationId: 'airlock',
  label: t.evaMission,

  unlocked(state: GameState) {
    return state.station.energy >= 2 && state.crews.kael.status === 'idle';
  },

  execute(_engine: VylosActionAPI, state: GameState) {
    state.station.energy = Math.max(0, state.station.energy - 2);
    state.crews.kael.stress = Math.max(0, state.crews.kael.stress - 10);
  },
} satisfies VylosAction<GameState>;

export default evaMission;
