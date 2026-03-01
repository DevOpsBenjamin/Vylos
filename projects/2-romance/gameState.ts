import { defineStore } from 'pinia';
import { ref } from 'vue';
import { deepMerge, type VylosGameState, type VylosGameStore } from '@vylos/core';

export interface RomanceGameState extends VylosGameState {
  energy: number;
  charm: number;
  day: number;
  npcs: Record<string, { affection: number; met: boolean; dates: number; events: string[] }>;
  inventory: string[];
}

function createState(): RomanceGameState {
  return {
    locationId: '',
    gameTime: 8,
    flags: {},
    counters: {},
    player: { id: 'player', name: 'Player' },
    inventories: {},
    energy: 100,
    charm: 20,
    day: 1,
    npcs: {
      maya: { affection: 0, met: false, dates: 0, events: [] },
      lena: { affection: 0, met: false, dates: 0, events: [] },
    },
    inventory: [],
  };
}

export const useRomanceGameStore = defineStore('gameState', () => {
  const state = ref<RomanceGameState>(createState());

  function getState(): RomanceGameState {
    return state.value;
  }

  function setState(newState: RomanceGameState) {
    state.value = deepMerge(createState(), newState) as RomanceGameState;
  }

  function getSnapshot(): RomanceGameState {
    return structuredClone(state.value);
  }

  function restoreSnapshot(snapshot: RomanceGameState) {
    state.value = deepMerge(createState(), snapshot) as RomanceGameState;
  }

  function $reset() {
    state.value = createState();
  }

  return { state, getState, setState, getSnapshot, restoreSnapshot, $reset } satisfies VylosGameStore;
});
