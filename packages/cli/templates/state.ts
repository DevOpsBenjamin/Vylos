import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { VylosGameState } from '@vylos/core';
import { deepMerge } from '@vylos/core';
import { type Player, createDefaultPlayer } from './player';

/** Your game state — extends VylosGameState with your own fields */
export interface GameState extends VylosGameState {
  player: Player;
}

export function createDefaultState(): GameState {
  return {
    locationId: '',
    gameTime: 8,
    flags: {},
    counters: {},
    player: createDefaultPlayer(),
    inventories: {},
  };
}

export const useGameStore = defineStore('gameState', () => {
  const state = ref<GameState>(createDefaultState());

  function getState(): GameState {
    return state.value;
  }

  function setState(newState: Partial<GameState>) {
    state.value = deepMerge(createDefaultState(), newState) as GameState;
  }

  function $reset() {
    state.value = createDefaultState();
  }

  return { state, getState, setState, $reset };
});
