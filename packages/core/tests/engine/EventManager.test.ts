import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventManager } from '../../src/engine/managers/EventManager';
import type { VylosEvent, VylosAPI, VylosGameState } from '../../src/engine/types';
import { EventStatus } from '../../src/engine/types';

function makeState(overrides: Partial<VylosGameState> = {}): VylosGameState {
  return {
    locationId: 'cafe',
    gameTime: 8,
    flags: {},
    counters: {},
    player: { id: 'alice', name: 'Alice' },
    inventories: {},
    ...overrides,
  };
}

function makeEvent(id: string, overrides: Partial<VylosEvent> = {}): VylosEvent {
  return {
    id,
    async execute(_engine: VylosAPI) { /* noop */ },
    ...overrides,
  };
}

describe('EventManager', () => {
  let em: EventManager;

  beforeEach(() => {
    em = new EventManager();
  });

  it('registers events', () => {
    em.register(makeEvent('ev1'));
    em.register(makeEvent('ev2'));
    expect(em.get('ev1')).toBeDefined();
    expect(em.get('ev2')).toBeDefined();
    expect(em.get('ev3')).toBeUndefined();
  });

  it('events start as NotReady', () => {
    em.register(makeEvent('ev1'));
    expect(em.getStatus('ev1')).toBe(EventStatus.NotReady);
  });

  describe('evaluate()', () => {
    it('unlocks events with no conditions', () => {
      em.register(makeEvent('ev1'));
      const unlocked = em.evaluate(makeState());
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('ev1');
      expect(em.getStatus('ev1')).toBe(EventStatus.Unlocked);
    });

    it('unlocks events when conditions are met', () => {
      em.register(makeEvent('ev1', {
        conditions: (state) => state.flags['intro_done'] === true,
      }));

      expect(em.evaluate(makeState())).toHaveLength(0);
      expect(em.getStatus('ev1')).toBe(EventStatus.NotReady);

      const unlocked = em.evaluate(makeState({ flags: { intro_done: true } }));
      expect(unlocked).toHaveLength(1);
    });

    it('calls unlocked() callback when transitioning', () => {
      const unlockedFn = vi.fn();
      em.register(makeEvent('ev1', { unlocked: unlockedFn }));
      em.evaluate(makeState());
      expect(unlockedFn).toHaveBeenCalledOnce();
    });

    it('does not re-evaluate already unlocked events', () => {
      em.register(makeEvent('ev1'));
      em.evaluate(makeState());
      const second = em.evaluate(makeState());
      expect(second).toHaveLength(0);
    });
  });

  it('getNextUnlocked returns first unlocked event', () => {
    em.register(makeEvent('ev1', {
      conditions: () => false,
    }));
    em.register(makeEvent('ev2'));
    em.evaluate(makeState());

    const next = em.getNextUnlocked(makeState());
    expect(next?.id).toBe('ev2');
  });

  it('lifecycle: NotReady → Unlocked → Running → Locked', () => {
    const lockedFn = vi.fn();
    em.register(makeEvent('ev1', { locked: lockedFn }));

    expect(em.getStatus('ev1')).toBe(EventStatus.NotReady);

    em.evaluate(makeState());
    expect(em.getStatus('ev1')).toBe(EventStatus.Unlocked);

    em.setRunning('ev1');
    expect(em.getStatus('ev1')).toBe(EventStatus.Running);

    em.setLocked('ev1', makeState());
    expect(em.getStatus('ev1')).toBe(EventStatus.Locked);
    expect(lockedFn).toHaveBeenCalledOnce();
  });

  it('getByLocation filters events', () => {
    em.register(makeEvent('ev1', { locationId: 'cafe' }));
    em.register(makeEvent('ev2', { locationId: 'bedroom' }));
    em.register(makeEvent('ev3', { locationId: 'cafe' }));

    const cafeEvents = em.getByLocation('cafe');
    expect(cafeEvents).toHaveLength(2);
    expect(cafeEvents.map(e => e.id)).toEqual(['ev1', 'ev3']);
  });

  it('getLockedIds / restoreLockedIds', () => {
    em.register(makeEvent('ev1'));
    em.register(makeEvent('ev2'));
    em.register(makeEvent('ev3'));

    em.evaluate(makeState());
    em.setLocked('ev1', makeState());
    em.setLocked('ev3', makeState());

    const ids = em.getLockedIds();
    expect(ids).toEqual(['ev1', 'ev3']);

    em.resetAll();
    em.restoreLockedIds(['ev1', 'ev3']);
    expect(em.getStatus('ev1')).toBe(EventStatus.Locked);
    expect(em.getStatus('ev2')).toBe(EventStatus.NotReady);
    expect(em.getStatus('ev3')).toBe(EventStatus.Locked);
  });

  it('reset puts event back to NotReady', () => {
    em.register(makeEvent('ev1'));
    em.evaluate(makeState());
    expect(em.getStatus('ev1')).toBe(EventStatus.Unlocked);
    em.reset('ev1');
    expect(em.getStatus('ev1')).toBe(EventStatus.NotReady);
  });
});
