import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryManager } from '../../src/engine/managers/HistoryManager';
import type { Checkpoint } from '../../src/engine/types';
import { CheckpointType } from '../../src/engine/types';

function makeCheckpoints(count: number): Checkpoint[] {
  return Array.from({ length: count }, (_, i) => ({
    step: i,
    gameState: {
      locationId: 'cafe',
      gameTime: 8 + i,
      flags: {},
      counters: {},
      player: { id: 'alice', name: 'Alice' },
    },
    type: CheckpointType.Say,
  }));
}

describe('HistoryManager', () => {
  let hm: HistoryManager;

  beforeEach(() => {
    hm = new HistoryManager();
  });

  it('starts empty', () => {
    expect(hm.count).toBe(0);
    expect(hm.canGoBack).toBe(false);
    expect(hm.canGoForward).toBe(false);
    expect(hm.current).toBeUndefined();
  });

  it('pushes entries and tracks current', () => {
    hm.push('event-1', makeCheckpoints(2));
    expect(hm.count).toBe(1);
    expect(hm.current?.eventId).toBe('event-1');

    hm.push('event-2', makeCheckpoints(3));
    expect(hm.count).toBe(2);
    expect(hm.current?.eventId).toBe('event-2');
  });

  it('goes back and forward', () => {
    hm.push('event-1', makeCheckpoints(2));
    hm.push('event-2', makeCheckpoints(3));
    hm.push('event-3', makeCheckpoints(1));

    expect(hm.canGoBack).toBe(true);
    expect(hm.canGoForward).toBe(false);

    const back1 = hm.goBack();
    expect(back1?.eventId).toBe('event-2');
    expect(hm.canGoBack).toBe(true);
    expect(hm.canGoForward).toBe(true);

    const back2 = hm.goBack();
    expect(back2?.eventId).toBe('event-1');
    expect(hm.canGoBack).toBe(false);

    const fwd1 = hm.goForward();
    expect(fwd1?.eventId).toBe('event-2');
  });

  it('trims forward history on push after goBack', () => {
    hm.push('event-1', makeCheckpoints(1));
    hm.push('event-2', makeCheckpoints(1));
    hm.push('event-3', makeCheckpoints(1));

    hm.goBack(); // at event-2
    hm.push('event-4', makeCheckpoints(1));

    expect(hm.count).toBe(3); // event-1, event-2, event-4
    expect(hm.current?.eventId).toBe('event-4');
    expect(hm.canGoForward).toBe(false);
  });

  it('goBack returns undefined when at start', () => {
    hm.push('event-1', makeCheckpoints(1));
    expect(hm.goBack()).toBeUndefined();
  });

  it('goForward returns undefined when at end', () => {
    hm.push('event-1', makeCheckpoints(1));
    expect(hm.goForward()).toBeUndefined();
  });

  it('clear removes all history', () => {
    hm.push('event-1', makeCheckpoints(2));
    hm.push('event-2', makeCheckpoints(3));
    hm.clear();
    expect(hm.count).toBe(0);
    expect(hm.canGoBack).toBe(false);
  });

  it('getAll returns deep clones', () => {
    hm.push('event-1', makeCheckpoints(2));
    const all = hm.getAll();
    all[0].eventId = 'hacked';
    expect(hm.current?.eventId).toBe('event-1');
  });

  it('restore loads from save data', () => {
    const entries = [
      { eventId: 'ev1', checkpoints: makeCheckpoints(2) },
      { eventId: 'ev2', checkpoints: makeCheckpoints(1) },
    ];
    hm.restore(entries, 1);
    expect(hm.count).toBe(2);
    expect(hm.current?.eventId).toBe('ev2');
    expect(hm.canGoBack).toBe(true);
  });
});
