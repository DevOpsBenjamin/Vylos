import { describe, it, expect, beforeEach } from 'vitest';
import { ActionManager } from '../../src/engine/managers/ActionManager';
import type { VylosAction, VylosActionAPI, VylosGameState } from '../../src/engine/types';
import { JumpSignal } from '../../src/engine/errors/JumpSignal';

interface TestState extends VylosGameState {
  flags: Record<string, boolean>;
  counters: Record<string, number>;
}

function makeState(overrides: Partial<TestState> = {}): TestState {
  return {
    locationId: 'cafe',
    gameTime: 12,
    flags: {},
    counters: {},
    player: { id: 'alice', name: 'Alice' },
    inventories: {},
    ...overrides,
  };
}

const mockActionAPI: VylosActionAPI = {
  jump(eventId: string): never { throw new JumpSignal(eventId); },
  get inventory() { return {} as VylosActionAPI['inventory']; },
};

describe('ActionManager', () => {
  let am: ActionManager;

  const sleepAction: VylosAction = {
    id: 'sleep',
    label: 'Go to Sleep',
    locationId: 'bedroom',
    execute(_engine, state) {
      state.gameTime += 8;
    },
  };

  const orderCoffee: VylosAction = {
    id: 'order_coffee',
    label: 'Order Coffee',
    locationId: 'cafe',
    unlocked: (state) => (state as TestState).counters['coffee_count'] === undefined || (state as TestState).counters['coffee_count'] < 3,
    execute(_engine, state) {
      (state as TestState).counters['coffee_count'] = ((state as TestState).counters['coffee_count'] ?? 0) + 1;
    },
  };

  const globalAction: VylosAction = {
    id: 'check_phone',
    label: 'Check Phone',
    execute(_engine, state) {
      (state as TestState).flags['checked_phone'] = true;
    },
  };

  beforeEach(() => {
    am = new ActionManager();
    am.registerAll([sleepAction, orderCoffee, globalAction]);
  });

  it('registers and retrieves actions', () => {
    expect(am.get('sleep')).toBeDefined();
    expect(am.get('order_coffee')).toBeDefined();
    expect(am.get('nope')).toBeUndefined();
  });

  it('getAvailable filters by location', () => {
    const state = makeState();
    const cafeActions = am.getAvailable('cafe', state);
    expect(cafeActions.map(a => a.id)).toContain('order_coffee');
    expect(cafeActions.map(a => a.id)).toContain('check_phone'); // global
    expect(cafeActions.map(a => a.id)).not.toContain('sleep'); // bedroom only
  });

  it('getAvailable includes global actions everywhere', () => {
    const state = makeState();
    const bedroomActions = am.getAvailable('bedroom', state);
    expect(bedroomActions.map(a => a.id)).toContain('check_phone');
    expect(bedroomActions.map(a => a.id)).toContain('sleep');
  });

  it('getAvailable respects unlock conditions', () => {
    const state = makeState({ counters: { coffee_count: 3 } });
    const actions = am.getAvailable('cafe', state);
    expect(actions.map(a => a.id)).not.toContain('order_coffee');
  });

  it('execute runs action and mutates state', () => {
    const state = makeState();
    const result = am.execute('order_coffee', state, mockActionAPI);
    expect(result).toBe(true);
    expect((state as TestState).counters['coffee_count']).toBe(1);
  });

  it('execute returns false for unknown action', () => {
    const state = makeState();
    expect(am.execute('nope', state, mockActionAPI)).toBe(false);
  });

  it('clear removes all actions', () => {
    am.clear();
    expect(am.get('sleep')).toBeUndefined();
  });
});
