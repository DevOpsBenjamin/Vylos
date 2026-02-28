import 'reflect-metadata';
import { container as globalContainer, type DependencyContainer } from 'tsyringe';
import type { VylosPlugin } from '../types';
import { type Component, shallowReactive } from 'vue';
import { EventManager } from '../managers/EventManager';
import { HistoryManager } from '../managers/HistoryManager';
import { NavigationManager } from '../managers/NavigationManager';
import { WaitManager } from '../managers/WaitManager';
import { SaveManager } from '../managers/SaveManager';
import { SettingsManager } from '../managers/SettingsManager';
import { EventRunner, type EventRunnerCallbacks } from './EventRunner';
import { CheckpointManager } from './CheckpointManager';
import { InventoryManager } from '../managers/InventoryManager';
import { VylosStorage } from '../storage/VylosStorage';
import { Engine } from './Engine';
import { logger } from '../utils/logger';

/** Tokens used for DI registration */
export const DI_TOKENS = {
  EventManager: 'EventManager',
  HistoryManager: 'HistoryManager',
  NavigationManager: 'NavigationManager',
  WaitManager: 'WaitManager',
  CheckpointManager: 'CheckpointManager',
  InventoryManager: 'InventoryManager',
  EventRunner: 'EventRunner',
  Engine: 'Engine',
} as const;

/** Component override map — stored on globalThis to survive dual-module resolution */
const GLOBAL_KEY = '__vylos_component_overrides__';
const componentOverrides: Record<string, Component> =
  (globalThis as any)[GLOBAL_KEY] ??= shallowReactive<Record<string, Component>>({});

/** Register all default managers in a DI container */
function registerDefaults(c: DependencyContainer): void {
  c.register(DI_TOKENS.EventManager, { useClass: EventManager });
  c.register(DI_TOKENS.HistoryManager, { useClass: HistoryManager });
  c.register(DI_TOKENS.NavigationManager, { useClass: NavigationManager });
  c.register(DI_TOKENS.WaitManager, { useClass: WaitManager });
  c.register(DI_TOKENS.CheckpointManager, { useClass: CheckpointManager });
  c.register(DI_TOKENS.InventoryManager, { useClass: InventoryManager });
}

export interface CreateEngineOptions {
  /** Project plugin for DI overrides and component overrides */
  plugin?: VylosPlugin;
  /** Callbacks for EventRunner (UI integration) */
  callbacks: EventRunnerCallbacks;
  /** Project ID for storage isolation (default: 'default') */
  projectId?: string;
}

/**
 * Create and wire an Engine instance with all managers.
 * Projects can provide a plugin to override any manager.
 */
export function createEngine(options: CreateEngineOptions): Engine {
  // Create a child container so tests/multiple instances don't conflict
  const childContainer = globalContainer.createChildContainer();

  // Register defaults
  registerDefaults(childContainer);

  // Apply plugin overrides (plugin can re-register any token)
  if (options.plugin?.setup) {
    options.plugin.setup(childContainer);
  }

  // Register component overrides
  if (options.plugin?.components) {
    for (const [id, component] of Object.entries(options.plugin.components)) {
      componentOverrides[id] = component;
      logger.debug(`Component override registered: ${id}`);
    }
  }

  // Resolve managers
  const eventManager = childContainer.resolve<EventManager>(DI_TOKENS.EventManager);
  const historyManager = childContainer.resolve<HistoryManager>(DI_TOKENS.HistoryManager);
  const navigationManager = childContainer.resolve<NavigationManager>(DI_TOKENS.NavigationManager);
  const inventoryManager = childContainer.resolve<InventoryManager>(DI_TOKENS.InventoryManager);

  // EventRunner needs callbacks + inventoryManager, so we construct it directly
  const eventRunner = new EventRunner(options.callbacks, inventoryManager);

  // Storage + persistence managers
  const storage = new VylosStorage(options.projectId ?? 'default');
  const saveManager = new SaveManager(storage);
  const settingsManager = new SettingsManager(storage);

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
