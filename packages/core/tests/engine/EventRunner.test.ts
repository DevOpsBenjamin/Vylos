import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventRunner, type EventRunnerCallbacks } from '../../src/engine/core/EventRunner';
import { InventoryManager } from '../../src/engine/managers/InventoryManager';
import type { VylosEvent, VylosAPI, BaseGameState } from '../../src/engine/types';
import { JumpSignal } from '../../src/engine/errors/JumpSignal';
import { EventEndError } from '../../src/engine/errors/EventEndError';

function makeState(overrides: Partial<BaseGameState> = {}): BaseGameState {
  return {
    locationId: 'cafe',
    gameTime: 8,
    flags: {},
    counters: {},
    player: { name: 'Alice' },
    inventories: {},
    ...overrides,
  };
}

function makeCallbacks(state?: BaseGameState): EventRunnerCallbacks & { state: BaseGameState } {
  const s = state ?? makeState();
  return {
    state: s,
    onSay: vi.fn(),
    onChoice: vi.fn(),
    onSetBackground: vi.fn(),
    onSetForeground: vi.fn(),
    onShowOverlay: vi.fn(),
    onHideOverlay: vi.fn(),
    onSetLocation: vi.fn(),
    onClear: vi.fn(),
    resolveText: vi.fn((text: unknown) => typeof text === 'string' ? text : 'resolved'),
    getState: vi.fn(() => s),
    setState: vi.fn((newState: BaseGameState) => { Object.assign(s, newState); }),
  };
}

describe('EventRunner', () => {
  let callbacks: ReturnType<typeof makeCallbacks>;
  let runner: EventRunner;

  beforeEach(() => {
    callbacks = makeCallbacks();
    runner = new EventRunner(callbacks, new InventoryManager());
  });

  describe('say()', () => {
    it('displays dialogue and waits for continue', async () => {
      const event: VylosEvent = {
        id: 'test-say',
        async execute(engine: VylosAPI) {
          await engine.say('Hello world');
        },
      };

      // Start execution (will pause at say)
      const promise = runner.executeEvent(event);

      // Wait a tick for the say to be called
      await vi.waitFor(() => {
        expect(callbacks.onSay).toHaveBeenCalledWith('Hello world', null);
      });

      // Simulate player clicking continue
      runner.resolveWait();

      await promise;
      expect(callbacks.onClear).toHaveBeenCalled();
    });

    it('passes Character object as speaker', async () => {
      const barista = { id: 'barista', name: 'Barista' };
      const event: VylosEvent = {
        id: 'test-speaker',
        async execute(engine: VylosAPI) {
          await engine.say('Hi!', { from: barista });
        },
      };

      const promise = runner.executeEvent(event);

      await vi.waitFor(() => {
        expect(callbacks.onSay).toHaveBeenCalledWith('Hi!', barista);
      });

      runner.resolveWait();
      await promise;
    });

    it('interpolates variables', async () => {
      callbacks.resolveText = vi.fn((t: unknown) => typeof t === 'string' ? t : 'resolved');

      const event: VylosEvent = {
        id: 'test-vars',
        async execute(engine: VylosAPI) {
          await engine.say('Hello {name}!', { variables: { name: 'Bob' } });
        },
      };

      const promise = runner.executeEvent(event);

      await vi.waitFor(() => {
        expect(callbacks.onSay).toHaveBeenCalledWith('Hello Bob!', null);
      });

      runner.resolveWait();
      await promise;
    });
  });

  describe('choice()', () => {
    it('shows choices and returns selected value', async () => {
      let result = '';
      const event: VylosEvent = {
        id: 'test-choice',
        async execute(engine: VylosAPI) {
          result = await engine.choice([
            { text: 'Coffee', value: 'coffee' },
            { text: 'Tea', value: 'tea' },
          ]);
        },
      };

      const promise = runner.executeEvent(event);

      await vi.waitFor(() => {
        expect(callbacks.onChoice).toHaveBeenCalled();
      });

      // Simulate player choosing "tea"
      runner.resolveWait('tea');
      await promise;

      expect(result).toBe('tea');
    });

    it('filters choices by condition', async () => {
      const event: VylosEvent = {
        id: 'test-choice-filter',
        async execute(engine: VylosAPI) {
          await engine.choice([
            { text: 'Coffee', value: 'coffee' },
            { text: 'Secret', value: 'secret', condition: () => false },
          ]);
        },
      };

      const promise = runner.executeEvent(event);

      await vi.waitFor(() => {
        expect(callbacks.onChoice).toHaveBeenCalled();
        const options = callbacks.onChoice.mock.calls[0][0];
        expect(options).toHaveLength(1);
        expect(options[0].value).toBe('coffee');
      });

      runner.resolveWait('coffee');
      await promise;
    });
  });

  describe('inline choice branching', () => {
    it('supports if/else based on choice result', async () => {
      const spoken: string[] = [];
      callbacks.onSay = vi.fn((_text: string) => { spoken.push(_text); });

      const event: VylosEvent = {
        id: 'test-branch',
        async execute(engine: VylosAPI) {
          await engine.say('Welcome!');
          const pick = await engine.choice([
            { text: 'Coffee', value: 'coffee' },
            { text: 'Tea', value: 'tea' },
          ]);
          if (pick === 'coffee') {
            await engine.say('Good choice!');
          } else {
            await engine.say('Coming right up!');
          }
          await engine.say('Enjoy.');
        },
      };

      const promise = runner.executeEvent(event);

      // Step 1: "Welcome!"
      await vi.waitFor(() => expect(spoken).toContain('Welcome!'));
      runner.resolveWait();

      // Step 2: Choice
      await vi.waitFor(() => expect(callbacks.onChoice).toHaveBeenCalled());
      runner.resolveWait('coffee');

      // Step 3: "Good choice!" (not "Coming right up!")
      await vi.waitFor(() => expect(spoken).toContain('Good choice!'));
      runner.resolveWait();

      // Step 4: "Enjoy."
      await vi.waitFor(() => expect(spoken).toContain('Enjoy.'));
      runner.resolveWait();

      await promise;

      expect(spoken).toEqual(['Welcome!', 'Good choice!', 'Enjoy.']);
      expect(spoken).not.toContain('Coming right up!');
    });
  });

  describe('jump()', () => {
    it('throws JumpSignal', async () => {
      const event: VylosEvent = {
        id: 'test-jump',
        async execute(engine: VylosAPI) {
          engine.jump('other-event');
        },
      };

      await expect(runner.executeEvent(event)).rejects.toThrow(JumpSignal);
    });

    it('carries target event ID', async () => {
      const event: VylosEvent = {
        id: 'test-jump-id',
        async execute(engine: VylosAPI) {
          engine.jump('intro');
        },
      };

      try {
        await runner.executeEvent(event);
      } catch (e) {
        expect(e).toBeInstanceOf(JumpSignal);
        expect((e as JumpSignal).targetEventId).toBe('intro');
      }
    });
  });

  describe('end()', () => {
    it('ends event cleanly', async () => {
      const spoken: string[] = [];
      callbacks.onSay = vi.fn((t: string) => spoken.push(t));

      const event: VylosEvent = {
        id: 'test-end',
        async execute(engine: VylosAPI) {
          await engine.say('Before end');
          engine.end();
          // This should never execute
          await engine.say('After end');
        },
      };

      const promise = runner.executeEvent(event);

      await vi.waitFor(() => expect(spoken).toContain('Before end'));
      runner.resolveWait();

      await promise;
      expect(spoken).not.toContain('After end');
    });
  });

  describe('setBackground / setForeground', () => {
    it('calls callbacks synchronously', async () => {
      const event: VylosEvent = {
        id: 'test-bg',
        async execute(engine: VylosAPI) {
          engine.setBackground('/bg.jpg');
          engine.setForeground('/fg.png');
        },
      };

      await runner.executeEvent(event);
      expect(callbacks.onSetBackground).toHaveBeenCalledWith('/bg.jpg');
      expect(callbacks.onSetForeground).toHaveBeenCalledWith('/fg.png');
    });
  });

  describe('inventory API', () => {
    it('add() delegates to InventoryManager with current state', async () => {
      const event: VylosEvent = {
        id: 'test-inv-add',
        async execute(engine: VylosAPI) {
          engine.inventory.add('backpack', 'potion', 3);
        },
      };

      await runner.executeEvent(event);
      expect(callbacks.state.inventories['backpack']?.['potion']).toBe(3);
    });

    it('has() reads current state', async () => {
      callbacks.state.inventories = { backpack: { potion: 5 } };
      let result = false;

      const event: VylosEvent = {
        id: 'test-inv-has',
        async execute(engine: VylosAPI) {
          result = engine.inventory.has('backpack', 'potion', 3);
        },
      };

      await runner.executeEvent(event);
      expect(result).toBe(true);
    });

    it('remove() mutates state', async () => {
      callbacks.state.inventories = { backpack: { potion: 5 } };

      const event: VylosEvent = {
        id: 'test-inv-remove',
        async execute(engine: VylosAPI) {
          engine.inventory.remove('backpack', 'potion', 2);
        },
      };

      await runner.executeEvent(event);
      expect(callbacks.state.inventories['backpack']?.['potion']).toBe(3);
    });

    it('count() returns correct value', async () => {
      callbacks.state.inventories = { backpack: { potion: 7 } };
      let result = 0;

      const event: VylosEvent = {
        id: 'test-inv-count',
        async execute(engine: VylosAPI) {
          result = engine.inventory.count('backpack', 'potion');
        },
      };

      await runner.executeEvent(event);
      expect(result).toBe(7);
    });

    it('list() returns bag contents', async () => {
      callbacks.state.inventories = { backpack: { potion: 3, sword: 1 } };
      let result: Array<[string, number]> = [];

      const event: VylosEvent = {
        id: 'test-inv-list',
        async execute(engine: VylosAPI) {
          result = engine.inventory.list('backpack');
        },
      };

      await runner.executeEvent(event);
      expect(result).toEqual([['potion', 3], ['sword', 1]]);
    });

    it('clear() empties a bag', async () => {
      callbacks.state.inventories = { backpack: { potion: 3, sword: 1 } };

      const event: VylosEvent = {
        id: 'test-inv-clear',
        async execute(engine: VylosAPI) {
          engine.inventory.clear('backpack');
        },
      };

      await runner.executeEvent(event);
      expect(callbacks.state.inventories['backpack']).toBeUndefined();
    });
  });

  describe('checkpoints', () => {
    it('captures checkpoint for each say', async () => {
      const event: VylosEvent = {
        id: 'test-cp',
        async execute(engine: VylosAPI) {
          await engine.say('Line 1');
          await engine.say('Line 2');
        },
      };

      const promise = runner.executeEvent(event);

      await vi.waitFor(() => expect(callbacks.onSay).toHaveBeenCalled());
      runner.resolveWait();

      await vi.waitFor(() => expect(callbacks.onSay).toHaveBeenCalledTimes(2));
      runner.resolveWait();

      await promise;
      expect(runner.checkpoints.count).toBe(2);
    });

    it('captures choice result in checkpoint', async () => {
      const event: VylosEvent = {
        id: 'test-cp-choice',
        async execute(engine: VylosAPI) {
          await engine.choice([
            { text: 'A', value: 'a' },
            { text: 'B', value: 'b' },
          ]);
        },
      };

      const promise = runner.executeEvent(event);
      await vi.waitFor(() => expect(callbacks.onChoice).toHaveBeenCalled());
      runner.resolveWait('b');
      await promise;

      const all = runner.checkpoints.getAll();
      expect(all[0].choiceResult).toBe('b');
    });
  });
});
