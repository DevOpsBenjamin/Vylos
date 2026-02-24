import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { BaseGameState } from '../engine/types';

/** Default initial game state */
function createDefaultState(): BaseGameState {
  return {
    locationId: '',
    gameTime: 8,
    flags: {},
    counters: {},
    player: {
      name: 'Player',
    },
  };
}

export const useGameStateStore = defineStore('gameState', () => {
  const state = ref<BaseGameState>(createDefaultState());

  function getState(): BaseGameState {
    return state.value;
  }

  function setState(newState: BaseGameState) {
    state.value = newState;
  }

  function getSnapshot(): BaseGameState {
    return structuredClone(state.value);
  }

  function restoreSnapshot(snapshot: BaseGameState) {
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
