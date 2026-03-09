import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import texts from 'vylos:texts';
const t = texts.reactor.actions;

const boostEnergy = {
  id: 'boost_energy',
  locationId: 'reactor',
  label: t.boostEnergy,

  unlocked(state: GameState) {
    return state.station.energy < 60;
  },

  execute(_engine: VylosActionAPI, state: GameState) {
    state.station.energy = Math.min(100, state.station.energy + 15);
    const reactor = state.station.modules.reactor;
    reactor.integrity = Math.max(0, reactor.integrity - 5);
    if (reactor.integrity < 30) {
      reactor.damaged = true;
    }
  },
} satisfies VylosAction<GameState>;

export default boostEnergy;
