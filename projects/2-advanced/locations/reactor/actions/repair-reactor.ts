import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { BALANCE } from '@game/gameState/time';
import t from 'vylos:texts/reactor/actions';

const repairReactor = {
  id: 'repair_reactor',
  locationId: 'reactor',
  label: t.repairReactor,

  unlocked(state: GameState) {
    return state.station.modules.reactor.integrity < 100 && state.station.materials >= 5;
  },

  execute(_engine: VylosActionAPI, state: GameState) {
    state.station.materials -= 5;
    const reactor = state.station.modules.reactor;
    reactor.integrity = Math.min(100, reactor.integrity + BALANCE.repairAmount);
    if (reactor.integrity >= 30) {
      reactor.damaged = false;
    }
  },
} satisfies VylosAction<GameState>;

export default repairReactor;
