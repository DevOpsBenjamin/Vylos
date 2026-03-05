import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventManager } from '../../src/engine/managers/EventManager';
import type { VylosEvent, VylosEventAPI, VylosGameState } from '../../src/engine/types';
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
    async execute(_engine: VylosEventAPI) { /* noop */ },
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

  describe('evaluate() — unlocked() gate', () => {
    it('moves events with no unlocked() to Ready', () => {
      em.register(makeEvent('ev1'));
      const ready = em.evaluate(makeState());
      expect(ready).toHaveLength(1);
      expect(ready[0].id).toBe('ev1');
      expect(em.getStatus('ev1')).toBe(EventStatus.Ready);
    });

    it('moves events when unlocked() returns true', () => {
      em.register(makeEvent('ev1', {
        unlocked: () => true,
      }));
      const ready = em.evaluate(makeState());
      expect(ready).toHaveLength(1);
      expect(em.getStatus('ev1')).toBe(EventStatus.Ready);
    });

    it('keeps events NotReady when unlocked() returns false', () => {
      em.register(makeEvent('ev1', {
        unlocked: (state) => state.flags['intro_done'] === true,
      }));

      expect(em.evaluate(makeState())).toHaveLength(0);
      expect(em.getStatus('ev1')).toBe(EventStatus.NotReady);

      const ready = em.evaluate(makeState({ flags: { intro_done: true } }));
      expect(ready).toHaveLength(1);
      expect(em.getStatus('ev1')).toBe(EventStatus.Ready);
    });

    it('does not re-evaluate already Ready events', () => {
      em.register(makeEvent('ev1'));
      em.evaluate(makeState());
      const second = em.evaluate(makeState());
      expect(second).toHaveLength(0);
    });

    it('does not check conditions — only unlocked() gate', () => {
      em.register(makeEvent('ev1', {
        conditions: () => false,
      }));
      // evaluate() ignores conditions — event goes Ready anyway
      const ready = em.evaluate(makeState());
      expect(ready).toHaveLength(1);
      expect(em.getStatus('ev1')).toBe(EventStatus.Ready);
    });
  });

  describe('getNextUnlocked() — conditions checked at query time', () => {
    it('returns first Ready event with no conditions', () => {
      em.register(makeEvent('ev1'));
      em.evaluate(makeState());
      const next = em.getNextUnlocked(makeState());
      expect(next?.id).toBe('ev1');
    });

    it('skips Ready event when conditions return false', () => {
      em.register(makeEvent('ev1', {
        conditions: () => false,
      }));
      em.register(makeEvent('ev2'));
      em.evaluate(makeState());

      const next = em.getNextUnlocked(makeState());
      expect(next?.id).toBe('ev2');
    });

    it('returns Ready event when conditions return true', () => {
      em.register(makeEvent('ev1', {
        conditions: (state) => state.flags['go'] === true,
      }));
      em.evaluate(makeState());

      expect(em.getNextUnlocked(makeState())).toBeUndefined();
      expect(em.getNextUnlocked(makeState({ flags: { go: true } }))?.id).toBe('ev1');
    });
  });

  describe('lifecycle: NotReady → Ready → Running → Ready/Locked', () => {
    it('repeatable event: Ready → Running → Ready', () => {
      em.register(makeEvent('ev1'));

      expect(em.getStatus('ev1')).toBe(EventStatus.NotReady);

      em.evaluate(makeState());
      expect(em.getStatus('ev1')).toBe(EventStatus.Ready);

      em.setRunning('ev1');
      expect(em.getStatus('ev1')).toBe(EventStatus.Running);

      em.setReady('ev1');
      expect(em.getStatus('ev1')).toBe(EventStatus.Ready);
    });

    it('one-shot event: Ready → Running → Locked', () => {
      em.register(makeEvent('ev1'));

      em.evaluate(makeState());
      em.setRunning('ev1');
      em.setLocked('ev1');
      expect(em.getStatus('ev1')).toBe(EventStatus.Locked);
    });

    it('setLocked is a pure status setter (no callback)', () => {
      const lockedFn = vi.fn();
      em.register(makeEvent('ev1', { locked: lockedFn }));

      em.evaluate(makeState());
      em.setRunning('ev1');
      em.setLocked('ev1');
      expect(em.getStatus('ev1')).toBe(EventStatus.Locked);
      // locked() is NOT called by setLocked — Engine calls it explicitly
      expect(lockedFn).not.toHaveBeenCalled();
    });
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
    em.setLocked('ev1');
    em.setLocked('ev3');

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
    expect(em.getStatus('ev1')).toBe(EventStatus.Ready);
    em.reset('ev1');
    expect(em.getStatus('ev1')).toBe(EventStatus.NotReady);
  });

  it('setReady puts event directly to Ready (skips gate)', () => {
    em.register(makeEvent('ev1', {
      unlocked: () => false,
    }));
    // Gate blocks it
    em.evaluate(makeState());
    expect(em.getStatus('ev1')).toBe(EventStatus.NotReady);

    // setReady bypasses gate
    em.setReady('ev1');
    expect(em.getStatus('ev1')).toBe(EventStatus.Ready);
  });
});
