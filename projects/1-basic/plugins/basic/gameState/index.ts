import { createInventory } from '@game/items';
import { createFlags, Flags } from '@game/gameState/flags';
import { createPlayer, Player } from '@game/gameState/player';
import { createCharacters, Characters } from '@game/characters';
import { deepMerge, type VylosGameState, type VylosGameStore } from '@vylos/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Your game state — extends VylosGameState with project-specific fields.
 * Each section (player, characters, flags) is split into its own file for scalability.
 */
export interface GameState extends VylosGameState {
    player: Player;
    characters: Characters;
    flags: Flags;
}

export function createState(): GameState {
  return {
    locationId: 'home',
    gameTime: 8,
    player: createPlayer(),
    characters: createCharacters(),
    flags: createFlags(),
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
        // We use deepMerge to ensure any new defaults added in the future
        // automatically populate missing keys in older loaded states.
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