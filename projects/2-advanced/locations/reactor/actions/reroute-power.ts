import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import texts from 'vylos:texts';
const t = texts.reactor.actions;

const reroutePower = {
  id: 'reroute_power',
  locationId: 'reactor',
  label: t.reroutePower,

  unlocked(state: GameState) {
    return state.station.energy < 80;
  },

  execute(_engine: VylosActionAPI, state: GameState) {
    state.station.energy = Math.min(100, state.station.energy + 10);
  },
} satisfies VylosAction<GameState>;

export default reroutePower;
