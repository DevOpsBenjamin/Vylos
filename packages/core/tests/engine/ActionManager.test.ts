import { describe, it, expect, beforeEach } from 'vitest';
import { ActionManager } from '../../src/engine/managers/ActionManager';
import type { VylosAction, BaseGameState } from '../../src/engine/types';

function makeState(overrides: Partial<BaseGameState> = {}): BaseGameState {
  return {
    locationId: 'cafe',
    gameTime: 12,
    flags: {},
    counters: {},
    player: { name: 'Alice' },
    ...overrides,
  };
}

describe('ActionManager', () => {
  let am: ActionManager;

  const sleepAction: VylosAction = {
    id: 'sleep',
    label: 'Go to Sleep',
    locationId: 'bedroom',
    execute(state) {
      state.gameTime += 8;
    },
  };

  const orderCoffee: VylosAction = {
    id: 'order_coffee',
    label: 'Order Coffee',
    locationId: 'cafe',
    unlocked: (state) => state.counters['coffee_count'] === undefined || state.counters['coffee_count'] < 3,
    execute(state) {
      state.counters['coffee_count'] = (state.counters['coffee_count'] ?? 0) + 1;
    },
  };

  const globalAction: VylosAction = {
    id: 'check_phone',
    label: 'Check Phone',
    execute(state) {
      state.flags['checked_phone'] = true;
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
    const result = am.execute('order_coffee', state);
    expect(result).toBe(true);
    expect(state.counters['coffee_count']).toBe(1);
  });

  it('execute returns false for unknown action', () => {
    const state = makeState();
    expect(am.execute('nope', state)).toBe(false);
  });

  it('clear removes all actions', () => {
    am.clear();
    expect(am.get('sleep')).toBeUndefined();
  });
});
