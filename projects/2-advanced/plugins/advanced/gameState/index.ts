import { createInventory } from '@game/items';
import { type Flags, createFlags } from '@game/gameState/flags';
import { type Player, createPlayer } from '@game/gameState/player';
import { type Characters, createCharacters } from '@game/characters';
import { type JournalState, createJournalState } from '@game/gameState/journal';
import { deepMerge, type VylosGameState, type VylosGameStore } from '@vylos/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Your game state — extends VylosGameState with project-specific fields.
 * Each section (player, characters, flags, journal) is split into its own file for scalability.
 */
export interface GameState extends VylosGameState {
  player: Player;
  characters: Characters;
  flags: Flags;
  journal: JournalState;
}

export function createState(): GameState {
  return {
    locationId: '',
    gameTime: 8,
    player: createPlayer(),
    characters: createCharacters(),
    flags: createFlags(),
    journal: createJournalState(),
    inventories: createInventory(),
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
    return structuredClone(state.value);
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
