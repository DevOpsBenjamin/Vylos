import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { VylosGameState, VylosGameStore } from '@vylos/core';
import { deepMerge } from '@vylos/core';
import { type Player, createPlayer } from './player';

/** Your game state — extends VylosGameState with your own fields */
export interface GameState extends VylosGameState {
  player: Player;
}

export function createState(): GameState {
  return {
    locationId: '',
    gameTime: 8,
    flags: {},
    counters: {},
    player: createPlayer(),
    inventories: {},
  };
}

export const useGameStore = defineStore('gameState', () => {
  const state = ref<GameState>(createState());

  function getState(): GameState {
    return state.value;
  }

  function setState(newState: Partial<GameState>) {
    state.value = deepMerge(createState(), newState) as GameState;
  }

  function getSnapshot(): GameState {
    return structuredClone(state.value);
  }

  function restoreSnapshot(snapshot: GameState) {
    state.value = deepMerge(createState(), snapshot) as GameState;
  }

  function $reset() {
    state.value = createState();
  }

  return { state, getState, setState, getSnapshot, restoreSnapshot, $reset } satisfies VylosGameStore;
});
