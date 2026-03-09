import type { VylosEvent, VylosGameState, DrawableEventEntry, TextEntry } from '../types';
import { EventStatus } from '../types';
import { logger } from '../utils/logger';

interface EventEntry {
  event: VylosEvent;
  status: EventStatus;
}

/**
 * Manages event lifecycle: registration, condition evaluation, status transitions.
 *
 * Event lifecycle: NotReady → Ready → Running → Ready (or Locked)
 * - NotReady: unlocked() gate not yet passed
 * - Ready: available — conditions() checked each tick
 * - Running: currently executing
 * - Locked: permanently done (locked() returned true)
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

  /** Evaluate unlocked() gate for NotReady events. Returns newly ready events. */
  evaluate(state: VylosGameState): VylosEvent[] {
    const newlyReady: VylosEvent[] = [];

    for (const [id, entry] of this.events) {
      if (entry.status !== EventStatus.NotReady) continue;

      // unlocked() gate: if not defined or returns !== false → Ready
      if (entry.event.unlocked && entry.event.unlocked(state) === false) continue;

      entry.status = EventStatus.Ready;
      newlyReady.push(entry.event);
      logger.debug(`Event ready: ${id}`);
    }

    return newlyReady;
  }

  /** Get the next ready event matching the current location whose conditions are met. Skips drawable events. */
  getNextUnlocked(state: VylosGameState): VylosEvent | undefined {
    for (const entry of this.events.values()) {
      if (entry.status !== EventStatus.Ready) continue;
      if (entry.event.draw) continue; // Drawable events don't auto-trigger
      if (entry.event.locationId && entry.event.locationId !== state.locationId) continue;
      if (entry.event.conditions && !entry.event.conditions(state)) continue;
      return entry.event;
    }
    return undefined;
  }

  /** Get all ready drawable events at the current location whose conditions are met */
  getDrawableEvents(state: VylosGameState, normalizeText: (entry: string | TextEntry) => TextEntry): DrawableEventEntry[] {
    const result: DrawableEventEntry[] = [];
    for (const entry of this.events.values()) {
      if (entry.status !== EventStatus.Ready) continue;
      if (!entry.event.draw) continue;
      if (entry.event.locationId && entry.event.locationId !== state.locationId) continue;
      if (entry.event.conditions && !entry.event.conditions(state)) continue;
      const draw = entry.event.draw;
      result.push({
        id: entry.event.id,
        label: normalizeText(draw.label),
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

  /** Mark event as locked (permanently done) */
  setLocked(id: string): void {
    const entry = this.events.get(id);
    if (entry) {
      entry.status = EventStatus.Locked;
      logger.debug(`Event locked: ${id}`);
    }
  }

  /** Mark event as ready (skip unlocked() gate) */
  setReady(id: string): void {
    const entry = this.events.get(id);
    if (entry) {
      entry.status = EventStatus.Ready;
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

  /** Get event counts grouped by status */
  getStatusCounts(): Record<string, { count: number; ids: string[] }> {
    const result: Record<string, { count: number; ids: string[] }> = {};
    for (const [id, entry] of this.events) {
      if (!result[entry.status]) result[entry.status] = { count: 0, ids: [] };
      result[entry.status].count++;
      result[entry.status].ids.push(id);
    }
    return result;
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
