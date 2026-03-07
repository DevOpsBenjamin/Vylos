import { describe, it, expect, beforeEach } from 'vitest';
import { LocationManager } from '../src/engine/managers/LocationManager';
import type { VylosLocation, VylosGameState } from '../src/engine/types';

interface TestState extends VylosGameState {
  flags: Record<string, boolean>;
}

function makeState(overrides: Partial<TestState> = {}): TestState {
  return {
    locationId: 'room_a',
    gameTime: 12,
    flags: {},
    player: { id: 'player', name: 'Player' },
    inventories: {},
    ...overrides,
  };
}

const roomA: VylosLocation = {
  id: 'room_a',
  name: 'Room A',
  backgrounds: [{ path: '/room_a.jpg' }],
};

const roomB: VylosLocation = {
  id: 'room_b',
  name: 'Room B',
  backgrounds: [{ path: '/room_b.jpg' }],
};

const roomC: VylosLocation = {
  id: 'room_c',
  name: 'Room C',
  backgrounds: [{ path: '/room_c.jpg' }],
};

const roomD: VylosLocation = {
  id: 'room_d',
  name: 'Room D',
  backgrounds: [{ path: '/room_d.jpg' }],
};

describe('LocationManager.link()', () => {
  let lm: LocationManager;

  beforeEach(() => {
    lm = new LocationManager();
    lm.registerAll([roomA, roomB, roomC, roomD]);
  });

  it('creates directed links from one location to multiple targets', () => {
    lm.link('room_a', ['room_b', 'room_c']);

    const state = makeState();
    const accessible = lm.getAccessibleFrom('room_a', state);
    expect(accessible.map(l => l.id)).toEqual(['room_b', 'room_c']);
  });

  it('creates a single directed link with string shorthand', () => {
    lm.link('room_a', 'room_b');

    const state = makeState();
    const accessible = lm.getAccessibleFrom('room_a', state);
    expect(accessible.map(l => l.id)).toEqual(['room_b']);
  });

  it('creates a link with a condition', () => {
    lm.link('room_a', ['room_b'], {
      condition: (state) => (state as TestState).flags['has_key'] === true,
    });

    const stateWithout = makeState();
    expect(lm.getAccessibleFrom('room_a', stateWithout)).toHaveLength(0);

    const stateWith = makeState({ flags: { has_key: true } });
    expect(lm.getAccessibleFrom('room_a', stateWith).map(l => l.id)).toEqual(['room_b']);
  });

  it('is additive across multiple calls', () => {
    lm.link('room_a', 'room_b');
    lm.link('room_a', 'room_c');

    const state = makeState();
    const accessible = lm.getAccessibleFrom('room_a', state);
    expect(accessible.map(l => l.id)).toEqual(['room_b', 'room_c']);
  });

  it('accumulates links alongside setLinks()', () => {
    // link() first
    lm.link('room_a', 'room_b');

    // setLinks() replaces everything
    lm.setLinks([{ from: 'room_a', to: 'room_c' }]);

    const state = makeState();
    // After setLinks, the link() entry is gone — only room_c remains
    expect(lm.getAccessibleFrom('room_a', state).map(l => l.id)).toEqual(['room_c']);

    // Now link() adds on top of the setLinks result
    lm.link('room_a', 'room_d');
    expect(lm.getAccessibleFrom('room_a', state).map(l => l.id)).toEqual(['room_c', 'room_d']);
  });

  it('link() after setLinks() accumulates on existing links', () => {
    lm.setLinks([
      { from: 'room_a', to: 'room_b' },
      { from: 'room_b', to: 'room_a' },
    ]);

    lm.link('room_a', 'room_c');

    const state = makeState();
    const accessible = lm.getAccessibleFrom('room_a', state);
    expect(accessible.map(l => l.id)).toEqual(['room_b', 'room_c']);
  });

  it('does not create reverse links (directed only)', () => {
    lm.link('room_a', 'room_b');

    const state = makeState({ locationId: 'room_b' });
    const accessible = lm.getAccessibleFrom('room_b', state);
    expect(accessible).toHaveLength(0);
  });

  it('handles mixed conditional and unconditional links', () => {
    lm.link('room_a', 'room_b');
    lm.link('room_a', ['room_c'], {
      condition: (state) => state.gameTime >= 18,
    });
    lm.link('room_a', 'room_d');

    const daytime = makeState({ gameTime: 12 });
    expect(lm.getAccessibleFrom('room_a', daytime).map(l => l.id)).toEqual(['room_b', 'room_d']);

    const nighttime = makeState({ gameTime: 20 });
    expect(lm.getAccessibleFrom('room_a', nighttime).map(l => l.id)).toEqual([
      'room_b',
      'room_c',
      'room_d',
    ]);
  });

  it('clear() removes links added via link()', () => {
    lm.link('room_a', ['room_b', 'room_c']);
    lm.clear();

    const state = makeState();
    // Locations are gone too, so getAccessibleFrom returns empty
    expect(lm.getAccessibleFrom('room_a', state)).toHaveLength(0);
  });
});

/**
 * bootstrapVylos unit tests are intentionally omitted.
 *
 * bootstrapVylos() is a high-level orchestration function that:
 * - Creates a Vue application with createApp(GameShell)
 * - Sets up Pinia stores
 * - Creates the engine via createEngine() (which uses tsyringe DI)
 * - Mounts the app to #app
 * - Sets up a phase watcher to start the game loop
 *
 * Testing it in isolation would require mocking nearly every dependency
 * (Vue createApp, Pinia, GameShell component, createEngine, stores, etc.),
 * which would produce brittle tests that test the mock wiring rather than
 * real behavior. The function's correctness is better validated through:
 *
 * 1. Integration tests via the example projects (pnpm dev:basic, pnpm dev:romance)
 * 2. Unit tests of the individual pieces it orchestrates (LocationManager, ActionManager,
 *    EventRunner, stores, etc.) which are already well-covered
 * 3. The helper functions (buildResolveText, buildCallbacks) are private to the module
 *    and tested indirectly through their integration with the managers and stores
 */
