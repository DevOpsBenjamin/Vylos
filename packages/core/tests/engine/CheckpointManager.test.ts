import { describe, it, expect, beforeEach } from 'vitest';
import { CheckpointManager } from '../../src/engine/core/CheckpointManager';
import type { VylosGameState } from '../../src/engine/types';
import { CheckpointType } from '../../src/engine/types';

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

describe('CheckpointManager', () => {
  let cm: CheckpointManager;

  beforeEach(() => {
    cm = new CheckpointManager();
  });

  it('starts empty', () => {
    expect(cm.count).toBe(0);
    expect(cm.isReplaying).toBe(false);
  });

  it('captures checkpoints incrementally', () => {
    cm.capture(makeState(), CheckpointType.Say);
    cm.capture(makeState({ gameTime: 9 }), CheckpointType.Say);
    cm.capture(makeState({ gameTime: 10 }), CheckpointType.Choice, 'coffee');
    expect(cm.count).toBe(3);
  });

  it('stores deep clones (mutations do not affect checkpoints)', () => {
    const state = makeState();
    cm.capture(state, CheckpointType.Say);
    state.gameTime = 999;
    const restored = cm.getStateAt(0);
    expect(restored?.gameTime).toBe(8);
  });

  it('retrieves state at a specific step', () => {
    cm.capture(makeState({ gameTime: 8 }), CheckpointType.Say);
    cm.capture(makeState({ gameTime: 9 }), CheckpointType.Say);
    cm.capture(makeState({ gameTime: 10 }), CheckpointType.Choice, 'tea');

    expect(cm.getStateAt(0)?.gameTime).toBe(8);
    expect(cm.getStateAt(1)?.gameTime).toBe(9);
    expect(cm.getStateAt(2)?.gameTime).toBe(10);
    expect(cm.getStateAt(3)).toBeUndefined();
  });

  it('prepareRollback sets up replay mode', () => {
    cm.capture(makeState({ gameTime: 8 }), CheckpointType.Say);
    cm.capture(makeState({ gameTime: 9 }), CheckpointType.Say);
    cm.capture(makeState({ gameTime: 10 }), CheckpointType.Choice, 'tea');

    const state = cm.prepareRollback(1);
    expect(state?.gameTime).toBe(9);
    expect(cm.isReplaying).toBe(true);
    // Checkpoints after target are trimmed
    expect(cm.count).toBe(1);
  });

  it('replay advances step by step', () => {
    cm.capture(makeState({ gameTime: 8 }), CheckpointType.Say);
    cm.capture(makeState({ gameTime: 9 }), CheckpointType.Choice, 'coffee');
    cm.capture(makeState({ gameTime: 10 }), CheckpointType.Say);

    cm.prepareRollback(2);
    // After prepareRollback(2), we have checkpoints [0,1] and replayIndex=0
    expect(cm.isReplaying).toBe(true);
    expect(cm.count).toBe(2);

    // Advance past checkpoint 0
    cm.advanceReplay();
    expect(cm.isReplaying).toBe(true);

    // Advance past checkpoint 1
    cm.advanceReplay();
    // Now replayIndex=2 >= count=2, so replaying is done
    expect(cm.isReplaying).toBe(false);
  });

  it('getReplayChoiceResult returns stored value during replay', () => {
    cm.capture(makeState(), CheckpointType.Say);
    cm.capture(makeState(), CheckpointType.Choice, 'coffee');
    cm.capture(makeState(), CheckpointType.Say); // step 2

    // Rollback to step 1 — trims to [step0], replays from beginning
    cm.prepareRollback(1);
    expect(cm.count).toBe(1);
    // replayIndex starts at 0, checkpoints[0] is Say (no choice result)
    expect(cm.getReplayChoiceResult()).toBeUndefined();
    cm.advanceReplay();
    // replayIndex=1 >= count=1, replay done — choice at step 1 was trimmed
    expect(cm.isReplaying).toBe(false);
  });

  it('clear removes all checkpoints', () => {
    cm.capture(makeState(), CheckpointType.Say);
    cm.capture(makeState(), CheckpointType.Say);
    cm.clear();
    expect(cm.count).toBe(0);
    expect(cm.isReplaying).toBe(false);
  });

  it('getAll returns deep clones', () => {
    cm.capture(makeState(), CheckpointType.Say);
    const all = cm.getAll();
    expect(all.length).toBe(1);
    all[0].step = 999;
    expect(cm.getAll()[0].step).toBe(0);
  });

  it('restore loads checkpoints from save data', () => {
    const checkpoints = [
      { step: 0, gameState: makeState({ gameTime: 8 }), type: CheckpointType.Say },
      { step: 1, gameState: makeState({ gameTime: 9 }), type: CheckpointType.Choice, choiceResult: 'tea' },
    ];

    cm.restore(checkpoints);
    expect(cm.count).toBe(2);
    expect(cm.getStateAt(0)?.gameTime).toBe(8);
    expect(cm.getStateAt(1)?.gameTime).toBe(9);
  });

  it('prepareRollback returns undefined for invalid step', () => {
    expect(cm.prepareRollback(0)).toBeUndefined();
    cm.capture(makeState(), CheckpointType.Say);
    expect(cm.prepareRollback(5)).toBeUndefined();
    expect(cm.prepareRollback(-1)).toBeUndefined();
  });
});
