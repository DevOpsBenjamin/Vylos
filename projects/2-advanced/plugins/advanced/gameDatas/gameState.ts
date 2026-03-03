import { defineStore } from 'pinia';
import { ref } from 'vue';
import { deepMerge, type VylosGameState, type VylosGameStore } from '@vylos/core';
import { type PlayerState, createPlayerState } from './player';
import { type RelationshipState, createRelationshipState } from './relationships';
import { type JournalState, createJournalState } from './journal';

export interface AdvancedGameState extends VylosGameState, PlayerState, RelationshipState {
  journal: JournalState;
  inventory: string[];
}

function createState(): AdvancedGameState {
  return {
    locationId: '',
    gameTime: 8,
    flags: {},
    counters: {},
    player: { id: 'player', name: 'Player' },
    inventories: {},
    ...createPlayerState(),
    ...createRelationshipState(),
    journal: createJournalState(),
    inventory: [],
  };
}

export const useAdvancedGameStore = defineStore('gameState', () => {
  const state = ref<AdvancedGameState>(createState());

  function getState(): AdvancedGameState {
    return state.value;
  }

  function setState(newState: AdvancedGameState) {
    state.value = deepMerge(createState(), newState) as AdvancedGameState;
  }

  function getSnapshot(): AdvancedGameState {
    return structuredClone(state.value);
  }

  function restoreSnapshot(snapshot: AdvancedGameState) {
    state.value = deepMerge(createState(), snapshot) as AdvancedGameState;
  }

  function $reset() {
    state.value = createState();
  }

  const store = { state, getState, setState, getSnapshot, restoreSnapshot, $reset };
  return store satisfies VylosGameStore;
});
