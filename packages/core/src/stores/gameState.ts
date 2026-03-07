import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { VylosGameState } from '../engine/types';

/** Default initial game state */
function createDefaultState(): VylosGameState {
  return {
    locationId: '',
    gameTime: 8,
    player: {
      id: 'player',
      name: 'Player',
    },
    inventories: {},
  };
}

export const useGameStateStore = defineStore('gameState', () => {
  const state = ref<VylosGameState>(createDefaultState());

  function getState(): VylosGameState {
    return state.value;
  }

  function setState(newState: VylosGameState) {
    state.value = newState;
  }

  function getSnapshot(): VylosGameState {
    return structuredClone(state.value);
  }

  function restoreSnapshot(snapshot: VylosGameState) {
    state.value = structuredClone(snapshot);
  }

  function $reset() {
    state.value = createDefaultState();
  }

  return {
    state,
    getState,
    setState,
    getSnapshot,
    restoreSnapshot,
    $reset,
  };
});
