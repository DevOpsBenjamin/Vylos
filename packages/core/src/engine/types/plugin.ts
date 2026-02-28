import type { DependencyContainer } from 'tsyringe';
import type { Component, Ref } from 'vue';
import type { VylosGameState } from './game-state';

/**
 * Minimal contract for a game state store.
 * Compatible with the default `useGameStateStore` return type.
 * Projects with custom game state can implement this with additional properties.
 */
export interface VylosGameStore {
  /** Reactive game state ref */
  state: Ref<VylosGameState>;
  /** Get current (unwrapped) game state */
  getState(): VylosGameState;
  /** Replace the entire game state */
  setState(newState: VylosGameState): void;
  /** Deep-clone the current state for saving */
  getSnapshot(): VylosGameState;
  /** Restore a previously saved snapshot */
  restoreSnapshot(snapshot: VylosGameState): void;
  /** Reset to default initial state */
  $reset(): void;
}

/** Plugin interface for project-level engine customization */
export interface VylosPlugin {
  /** Register DI overrides (custom managers, etc.) */
  setup?(container: DependencyContainer): void;

  /** Override Vue components by component ID */
  components?: Record<string, Component>;

  /**
   * Provide a custom Pinia game state store factory.
   * When set, setupVylos will use this instead of the default `useGameStateStore`.
   * Useful for projects that extend VylosGameState with additional fields.
   */
  gameStore?(pinia?: any): VylosGameStore;
}
