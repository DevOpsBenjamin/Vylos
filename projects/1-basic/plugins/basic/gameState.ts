import { defineStore } from 'pinia';
import { ref } from 'vue';
import { deepMerge, type VylosGameState, type VylosGameStore } from '@vylos/core';

export interface BasicGameState extends VylosGameState {
  energy: number;
  day: number;
  maya_affection: number;
}

function createState(): BasicGameState {
  return {
    locationId: '',
    gameTime: 8,
    flags: {},
    counters: {},
    player: { id: 'player', name: 'Player' },
    inventories: {},
    energy: 100,
    day: 1,
    maya_affection: 0,
  };
}

export const useBasicGameStore = defineStore('gameState', () => {
  const state = ref<BasicGameState>(createState());

  function getState(): BasicGameState {
    return state.value;
  }

  function setState(newState: BasicGameState) {
    state.value = deepMerge(createState(), newState) as BasicGameState;
  }

  function getSnapshot(): BasicGameState {
    return structuredClone(state.value);
  }

  function restoreSnapshot(snapshot: BasicGameState) {
    state.value = deepMerge(createState(), snapshot) as BasicGameState;
  }

  function $reset() {
    state.value = createState();
  }

  const store = { state, getState, setState, getSnapshot, restoreSnapshot, $reset };
  return store satisfies VylosGameStore;
});
