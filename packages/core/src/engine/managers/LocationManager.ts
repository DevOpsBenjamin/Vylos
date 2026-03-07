import type { VylosLocation, LocationLink, VylosGameState } from '../types';
import { resolveBackground } from '../utils/TimeHelper';
import { logger } from '../utils/logger';

/**
 * Manages locations: registration, linking, accessibility, background resolution.
 */
export class LocationManager<TState extends VylosGameState = VylosGameState> {
  private locations = new Map<string, VylosLocation<TState>>();
  private links: LocationLink<TState>[] = [];

  /** Register a location */
  register(location: VylosLocation<TState>): void {
    this.locations.set(location.id, location);
    logger.debug(`Location registered: ${location.id}`);
  }

  /** Register multiple locations */
  registerAll(locations: VylosLocation<TState>[]): void {
    for (const loc of locations) {
      this.register(loc);
    }
  }

  /** Set the location link graph (replaces all existing links) */
  setLinks(links: LocationLink<TState>[]): void {
    this.links = links;
  }

  /** Add directed links from one location to one or more others (additive) */
  link(
    fromId: string,
    toIds: string | string[],
    options?: { condition?: (state: TState) => boolean },
  ): void {
    const targets = Array.isArray(toIds) ? toIds : [toIds];
    for (const toId of targets) {
      this.links.push({ from: fromId, to: toId, ...options });
    }
  }

  /** Get a location by ID */
  get(id: string): VylosLocation<TState> | undefined {
    return this.locations.get(id);
  }

  /** Get all registered locations */
  getAll(): VylosLocation<TState>[] {
    return [...this.locations.values()];
  }

  /** Get locations accessible from a given location, considering state conditions */
  getAccessibleFrom(locationId: string, state: TState): VylosLocation<TState>[] {
    const linkedIds = this.links
      .filter(link => {
        if (link.from !== locationId) return false;
        if (link.condition && !link.condition(state)) return false;
        return true;
      })
      .map(link => link.to);

    return linkedIds
      .map(id => this.locations.get(id))
      .filter((loc): loc is VylosLocation<TState> => {
        if (!loc) return false;
        if (loc.accessible && !loc.accessible(state)) return false;
        return true;
      });
  }

  /** Resolve the background image for a location at a given game time */
  resolveBackground(locationId: string, gameTime: number): string | null {
    const location = this.locations.get(locationId);
    if (!location) return null;
    return resolveBackground(location.backgrounds, gameTime);
  }

  /** Check if a location exists */
  has(id: string): boolean {
    return this.locations.has(id);
  }

  /** Clear all locations */
  clear(): void {
    this.locations.clear();
    this.links = [];
  }
}
