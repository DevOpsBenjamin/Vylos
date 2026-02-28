import type { VylosAction, VylosGameState, TextEntry } from '../types';
import { logger } from '../utils/logger';

/**
 * Manages player actions: registration, filtering by location and unlock conditions.
 */
export class ActionManager {
  private actions = new Map<string, VylosAction>();

  /** Register an action */
  register(action: VylosAction): void {
    this.actions.set(action.id, action);
    logger.debug(`Action registered: ${action.id}`);
  }

  /** Register multiple actions */
  registerAll(actions: VylosAction[]): void {
    for (const action of actions) {
      this.register(action);
    }
  }

  /** Get an action by ID */
  get(id: string): VylosAction | undefined {
    return this.actions.get(id);
  }

  /** Get all available actions for a location, filtered by unlock conditions */
  getAvailable(locationId: string, state: VylosGameState): VylosAction[] {
    const available: VylosAction[] = [];

    for (const action of this.actions.values()) {
      // Filter by location (global actions have no locationId)
      if (action.locationId && action.locationId !== locationId) continue;

      // Check unlock condition
      if (action.unlocked && !action.unlocked(state)) continue;

      available.push(action);
    }

    return available;
  }

  /** Execute an action by ID */
  execute(id: string, state: VylosGameState): boolean {
    const action = this.actions.get(id);
    if (!action) {
      logger.warn(`Action not found: ${id}`);
      return false;
    }

    action.execute(state);
    logger.debug(`Action executed: ${id}`);
    return true;
  }

  /** Clear all actions */
  clear(): void {
    this.actions.clear();
  }
}
