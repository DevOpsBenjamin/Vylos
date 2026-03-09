import { createFlags, type AegisFlags } from './flags';
import { createCrews, type Crews } from './crews';
import { createStation, type StationState } from './stations';
import { createScannerState, type ScannerState } from './scanner';
import { createUIState, type AegisUIState } from './ui';
import { createTimeState, PHASE_HOURS, type TimeState } from './time';
import { deepMerge, type VylosGameState, type VylosGameStore } from '@vylos/core';
import { defineStore } from 'pinia';
import { ref, toRaw } from 'vue';

/**
 * Aegis Protocol game state — extends VylosGameState with station management fields.
 * Each section is split into its own file for scalability.
 */
export interface GameState extends VylosGameState {
  time: TimeState;
  station: StationState;
  crews: Crews;
  flags: AegisFlags;
  ui: AegisUIState;
  ending: 'none' | 'bad' | 'neutral' | 'good';
  scanner: ScannerState;
}

export function createState(): GameState {
  return {
    locationId: 'bridge',
    gameTime: PHASE_HOURS.dawn,
    player: { id: 'commander', name: 'Commandant' },
    inventories: {},
    time: createTimeState(),
    station: createStation(),
    crews: createCrews(),
    flags: createFlags(),
    ui: createUIState(),
    ending: 'none',
    scanner: createScannerState(),
  };
}

/** Pinia store wrapping GameState. Implements VylosGameStore so the engine can save/load. */
export const useGameStore = defineStore('gameState', () => {
  const state = ref<GameState>(createState());

  function getState(): GameState {
    return state.value;
  }

  function setState(newState: GameState) {
    state.value = deepMerge(createState(), newState) as GameState;
  }

  function getSnapshot(): GameState {
    return structuredClone(toRaw(state.value));
  }

  function restoreSnapshot(snapshot: GameState) {
    state.value = deepMerge(createState(), snapshot) as GameState;
  }

  function $reset() {
    state.value = createState();
  }

  const store = { state, getState, setState, getSnapshot, restoreSnapshot, $reset };
  return store satisfies VylosGameStore;
});
