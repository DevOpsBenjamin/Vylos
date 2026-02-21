import type { DependencyContainer } from 'tsyringe';
import type { Component } from 'vue';

/** Plugin interface for project-level engine customization */
export interface VylosPlugin {
  /** Register DI overrides (custom managers, etc.) */
  setup?(container: DependencyContainer): void;

  /** Override Vue components by component ID */
  components?: Record<string, Component>;
}
