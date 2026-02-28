import type { VylosEvent, VylosGameState, DrawableEventEntry } from '../types';
import { EventStatus } from '../types';
import { logger } from '../utils/logger';

interface EventEntry {
  event: VylosEvent;
  status: EventStatus;
}

/**
 * Manages event lifecycle: registration, condition evaluation, status transitions.
 *
 * Event lifecycle: NotReady → Unlocked → Running → Locked
 * - NotReady: conditions not yet met
 * - Unlocked: conditions met, ready to execute
 * - Running: currently executing
 * - Locked: completed (won't trigger again)
 */
export class EventManager {
  private events = new Map<string, EventEntry>();

  /** Register an event */
  register(event: VylosEvent): void {
    this.events.set(event.id, {
      event,
      status: EventStatus.NotReady,
    });
    logger.debug(`Event registered: ${event.id}`);
  }

  /** Register multiple events */
  registerAll(events: VylosEvent[]): void {
    for (const event of events) {
      this.register(event);
    }
  }

  /** Get an event by ID */
  get(id: string): VylosEvent | undefined {
    return this.events.get(id)?.event;
  }

  /** Get event status */
  getStatus(id: string): EventStatus | undefined {
    return this.events.get(id)?.status;
  }

  /** Evaluate conditions and update statuses. Returns newly unlocked events. */
  evaluate(state: VylosGameState): VylosEvent[] {
    const unlocked: VylosEvent[] = [];

    for (const [id, entry] of this.events) {
      if (entry.status !== EventStatus.NotReady) continue;

      // Skip events bound to a different location
      if (entry.event.locationId && entry.event.locationId !== state.locationId) continue;

      const conditionsMet = !entry.event.conditions || entry.event.conditions(state);
      if (conditionsMet) {
        entry.status = EventStatus.Unlocked;
        entry.event.unlocked?.(state);
        unlocked.push(entry.event);
        logger.debug(`Event unlocked: ${id}`);
      }
    }

    return unlocked;
  }

  /** Get the next unlocked event matching the current location (first registered wins). Skips drawable events. */
  getNextUnlocked(state: VylosGameState): VylosEvent | undefined {
    for (const entry of this.events.values()) {
      if (entry.status !== EventStatus.Unlocked) continue;
      if (entry.event.draw) continue; // Drawable events don't auto-trigger
      if (entry.event.locationId && entry.event.locationId !== state.locationId) continue;
      return entry.event;
    }
    return undefined;
  }

  /** Get all unlocked drawable events at the current location */
  getDrawableEvents(state: VylosGameState, resolveText?: (text: string | Record<string, string>) => string): DrawableEventEntry[] {
    const result: DrawableEventEntry[] = [];
    for (const entry of this.events.values()) {
      if (entry.status !== EventStatus.Unlocked) continue;
      if (!entry.event.draw) continue;
      if (entry.event.locationId && entry.event.locationId !== state.locationId) continue;
      const draw = entry.event.draw;
      const label = typeof draw.label === 'string'
        ? draw.label
        : resolveText?.(draw.label) ?? Object.values(draw.label)[0] ?? entry.event.id;
      result.push({
        id: entry.event.id,
        label,
        position: draw.position ?? 'center',
        icon: draw.icon,
      });
    }
    return result;
  }

  /** Mark event as running */
  setRunning(id: string): void {
    const entry = this.events.get(id);
    if (entry) {
      entry.status = EventStatus.Running;
    }
  }

  /** Mark event as locked (completed) */
  setLocked(id: string, state: VylosGameState): void {
    const entry = this.events.get(id);
    if (entry) {
      entry.status = EventStatus.Locked;
      entry.event.locked?.(state);
      logger.debug(`Event locked: ${id}`);
    }
  }

  /** Reset an event back to NotReady */
  reset(id: string): void {
    const entry = this.events.get(id);
    if (entry) {
      entry.status = EventStatus.NotReady;
    }
  }

  /** Reset all events */
  resetAll(): void {
    for (const entry of this.events.values()) {
      entry.status = EventStatus.NotReady;
    }
  }

  /** Get all events for a specific location */
  getByLocation(locationId: string): VylosEvent[] {
    const result: VylosEvent[] = [];
    for (const entry of this.events.values()) {
      if (entry.event.locationId === locationId) {
        result.push(entry.event);
      }
    }
    return result;
  }

  /** Get locked event IDs (for save data) */
  getLockedIds(): string[] {
    const ids: string[] = [];
    for (const [id, entry] of this.events) {
      if (entry.status === EventStatus.Locked) {
        ids.push(id);
      }
    }
    return ids;
  }

  /** Restore locked state from save data */
  restoreLockedIds(ids: string[]): void {
    for (const id of ids) {
      const entry = this.events.get(id);
      if (entry) {
        entry.status = EventStatus.Locked;
      }
    }
  }
}
