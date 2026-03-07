import type { VylosPlugin } from '../types';
import { type Component, shallowReactive } from 'vue';
import { EventManager } from '../managers/EventManager';
import { HistoryManager } from '../managers/HistoryManager';
import { NavigationManager } from '../managers/NavigationManager';
import { SaveManager } from '../managers/SaveManager';
import { SettingsManager } from '../managers/SettingsManager';
import { EventRunner, type EventRunnerCallbacks } from './EventRunner';
import { InventoryManager } from '../managers/InventoryManager';
import { VylosStorage } from '../storage/VylosStorage';
import { Engine } from './Engine';
import { logger } from '../utils/logger';

/** Component override map — stored on globalThis to survive dual-module resolution */
const GLOBAL_KEY = '__vylos_component_overrides__';
const componentOverrides: Record<string, Component> =
  (globalThis as any)[GLOBAL_KEY] ??= shallowReactive<Record<string, Component>>({});

export interface CreateEngineOptions {
  /** Project plugin for component overrides and setup */
  plugin?: VylosPlugin;
  /** Callbacks for EventRunner (UI integration) */
  callbacks: EventRunnerCallbacks;
  /** Project ID for storage isolation (default: 'default') */
  projectId?: string;
}

/**
 * Create and wire an Engine instance with all managers.
 */
export function createEngine(options: CreateEngineOptions): Engine {
  // Create managers
  const eventManager = new EventManager();
  const historyManager = new HistoryManager();
  const navigationManager = new NavigationManager();
  const inventoryManager = new InventoryManager();

  // EventRunner needs callbacks + inventoryManager
  const eventRunner = new EventRunner(options.callbacks, inventoryManager);

  // Storage + persistence managers
  const storage = new VylosStorage(options.projectId ?? 'default');
  const saveManager = new SaveManager(storage);
  const settingsManager = new SettingsManager(storage);

  // Apply plugin setup (register items, categories, etc.)
  if (options.plugin?.setup) {
    options.plugin.setup({ inventoryManager });
  }

  // Register component overrides
  if (options.plugin?.components) {
    for (const [id, component] of Object.entries(options.plugin.components)) {
      componentOverrides[id] = component;
      logger.debug(`Component override registered: ${id}`);
    }
  }

  return new Engine({
    eventManager,
    historyManager,
    navigationManager,
    eventRunner,
    saveManager,
    settingsManager,
    inventoryManager,
  });
}

/** Get a component override by ID (returns undefined if no override) */
export function getComponentOverride(id: string): Component | undefined {
  return componentOverrides[id];
}

/** Clear all component overrides (for testing) */
export function clearComponentOverrides(): void {
  for (const key of Object.keys(componentOverrides)) {
    delete componentOverrides[key];
  }
}
