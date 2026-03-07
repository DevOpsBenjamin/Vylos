import { describe, it, expect, beforeEach } from 'vitest';
import { LocationManager } from '../../src/engine/managers/LocationManager';
import type { VylosLocation, VylosGameState } from '../../src/engine/types';

interface TestState extends VylosGameState {
  flags: Record<string, boolean>;
}

function makeState(overrides: Partial<TestState> = {}): TestState {
  return {
    locationId: 'bedroom',
    gameTime: 12,
    flags: {},
    player: { id: 'alice', name: 'Alice' },
    inventories: {},
    ...overrides,
  };
}

const bedroom: VylosLocation = {
  id: 'bedroom',
  name: 'Bedroom',
  backgrounds: [
    { path: '/bedroom_day.jpg', timeRange: [6, 18] },
    { path: '/bedroom_night.jpg', timeRange: [18, 6] },
  ],
};

const hallway: VylosLocation = {
  id: 'hallway',
  name: 'Hallway',
  backgrounds: [{ path: '/hallway.jpg' }],
};

const cafe: VylosLocation<TestState> = {
  id: 'cafe',
  name: { en: 'Cafe', fr: 'Café' },
  backgrounds: [{ path: '/cafe.jpg' }],
  accessible: (state) => state.flags['has_key'] === true,
};

describe('LocationManager', () => {
  let lm: LocationManager<TestState>;

  beforeEach(() => {
    lm = new LocationManager<TestState>();
    lm.registerAll([bedroom, hallway, cafe]);
  });

  it('registers and retrieves locations', () => {
    expect(lm.get('bedroom')).toBeDefined();
    expect(lm.get('hallway')).toBeDefined();
    expect(lm.get('cafe')).toBeDefined();
    expect(lm.get('nonexistent')).toBeUndefined();
  });

  it('has() checks existence', () => {
    expect(lm.has('bedroom')).toBe(true);
    expect(lm.has('nope')).toBe(false);
  });

  it('getAll returns all locations', () => {
    expect(lm.getAll()).toHaveLength(3);
  });

  describe('getAccessibleFrom', () => {
    beforeEach(() => {
      lm.setLinks([
        { from: 'bedroom', to: 'hallway' },
        { from: 'hallway', to: 'bedroom' },
        { from: 'hallway', to: 'cafe' },
      ]);
    });

    it('returns linked accessible locations', () => {
      const state = makeState({ flags: { has_key: true } });
      const accessible = lm.getAccessibleFrom('hallway', state);
      expect(accessible.map(l => l.id)).toContain('bedroom');
      expect(accessible.map(l => l.id)).toContain('cafe');
    });

    it('excludes inaccessible locations', () => {
      const state = makeState(); // no has_key flag
      const accessible = lm.getAccessibleFrom('hallway', state);
      expect(accessible.map(l => l.id)).toContain('bedroom');
      expect(accessible.map(l => l.id)).not.toContain('cafe');
    });

    it('only returns locations linked from source', () => {
      const state = makeState({ flags: { has_key: true } });
      const accessible = lm.getAccessibleFrom('bedroom', state);
      expect(accessible.map(l => l.id)).toEqual(['hallway']);
    });

    it('supports conditional links', () => {
      lm.setLinks<TestState>([
        { from: 'bedroom', to: 'hallway' },
        {
          from: 'bedroom',
          to: 'cafe',
          condition: (state) => state.flags['secret_path'] === true,
        },
      ]);

      const stateWithout = makeState({ flags: { has_key: true } });
      expect(lm.getAccessibleFrom('bedroom', stateWithout).map(l => l.id)).toEqual(['hallway']);

      const stateWith = makeState({ flags: { has_key: true, secret_path: true } });
      expect(lm.getAccessibleFrom('bedroom', stateWith).map(l => l.id)).toEqual(['hallway', 'cafe']);
    });
  });

  describe('resolveBackground', () => {
    it('resolves time-based background', () => {
      expect(lm.resolveBackground('bedroom', 12)).toBe('/bedroom_day.jpg');
      expect(lm.resolveBackground('bedroom', 22)).toBe('/bedroom_night.jpg');
    });

    it('resolves default background', () => {
      expect(lm.resolveBackground('hallway', 12)).toBe('/hallway.jpg');
    });

    it('returns null for unknown location', () => {
      expect(lm.resolveBackground('nope', 12)).toBeNull();
    });
  });

  it('clear removes everything', () => {
    lm.clear();
    expect(lm.getAll()).toHaveLength(0);
  });
});
