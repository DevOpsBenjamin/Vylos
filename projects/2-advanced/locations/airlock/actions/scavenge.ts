import type { VylosAction, VylosActionAPI } from '@vylos/core';
import type { GameState } from '@game/gameState';
import { BALANCE } from '@game/gameState/time';
import texts from 'vylos:texts';
const t = texts.airlock.actions;

const scavenge = {
  id: 'scavenge',
  locationId: 'airlock',
  label: t.scavenge,

  unlocked(state: GameState) {
    return state.station.materials < 50;
  },

  execute(_engine: VylosActionAPI, state: GameState) {
    state.station.materials = Math.min(50, state.station.materials + BALANCE.scavengeAmount);
  },
} satisfies VylosAction<GameState>;

export default scavenge;
