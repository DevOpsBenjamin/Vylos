import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventRunner, type EventRunnerCallbacks } from '../../src/engine/core/EventRunner';
import { EventManager } from '../../src/engine/managers/EventManager';
import { HistoryManager } from '../../src/engine/managers/HistoryManager';
import { NavigationManager } from '../../src/engine/managers/NavigationManager';
import { InventoryManager } from '../../src/engine/managers/InventoryManager';
import { SaveManager } from '../../src/engine/managers/SaveManager';
import { SettingsManager } from '../../src/engine/managers/SettingsManager';
import { VylosStorage } from '../../src/engine/storage/VylosStorage';
import { Engine } from '../../src/engine/core/Engine';
import type { VylosEventAPI, VylosEvent, VylosGameState } from '../../src/engine/types';
import { createEngine, clearComponentOverrides, getComponentOverride } from '../../src/engine/core/EngineFactory';
import type { VylosPlugin, PluginContext } from '../../src/engine/types';
import { defineComponent } from 'vue';

function makeState(overrides: Partial<VylosGameState> = {}): VylosGameState {
  return {
    locationId: 'cafe',
    gameTime: 8,
    player: { id: 'alice', name: 'Alice' },
    inventories: {},
    ...overrides,
  };
}

function makeCallbacks(state?: VylosGameState): EventRunnerCallbacks & { state: VylosGameState } {
  const s = state ?? makeState();
  return {
    state: s,
    onSay: vi.fn(),
    onChoice: vi.fn(),
    onSetBackground: vi.fn(),
    onSetForeground: vi.fn(),
    onSetLocation: vi.fn(),
    onClear: vi.fn(),
    normalizeText: vi.fn((text: unknown) => typeof text === 'string' ? { en: text } : text),
    getState: vi.fn(() => s),
    setState: vi.fn((newState: VylosGameState) => { Object.assign(s, newState); }),
  };
}

describe('Game loop integration', () => {
  it('executes an event, locks it, and records history', async () => {
    const callbacks = makeCallbacks();
    const inventoryManager = new InventoryManager();
    const eventRunner = new EventRunner(callbacks, inventoryManager);
    const eventManager = new EventManager();
    const historyManager = new HistoryManager();
    const navigationManager = new NavigationManager();
    const storage = new VylosStorage('test-loop-1');
    await storage.open();
    const saveManager = new SaveManager(storage);
    const settingsManager = new SettingsManager(storage);

    const engine = new Engine({
      eventManager,
      historyManager,
      inventoryManager,
      navigationManager,
      eventRunner,
      saveManager,
      settingsManager,
    });

    const event: VylosEvent = {
      id: 'intro',
      locked: () => true,
      async execute(api: VylosEventAPI) {
        await api.say('Hello');
        await api.say('World');
      },
    };

    // Start engine in background
    const runPromise = engine.run([event], callbacks.getState);

    // Wait for first say
    await vi.waitFor(() => expect(callbacks.onSay).toHaveBeenCalledWith({ en: 'Hello' }, null, undefined));
    eventRunner.resolveWait();

    // Wait for second say
    await vi.waitFor(() => expect(callbacks.onSay).toHaveBeenCalledWith({ en: 'World' }, null, undefined));
    eventRunner.resolveWait();

    // Event complete — now we need to handle navigation wait
    // Give engine a tick to process completion
    await new Promise(r => setTimeout(r, 50));

    // Stop engine
    engine.stop();
    await runPromise;

    // Verify event was locked
    expect(eventManager.getStatus('intro')).toBe('locked');
    // Verify history recorded
    expect(historyManager.count).toBe(1);
    expect(historyManager.current?.eventId).toBe('intro');
  });

  it('handles jump between events', async () => {
    const callbacks = makeCallbacks();
    const inventoryManager = new InventoryManager();
    const eventRunner = new EventRunner(callbacks, inventoryManager);
    const eventManager = new EventManager();
    const historyManager = new HistoryManager();
    const navigationManager = new NavigationManager();
    const storage = new VylosStorage('test-loop-2');
    await storage.open();
    const saveManager = new SaveManager(storage);
    const settingsManager = new SettingsManager(storage);

    const engine = new Engine({
      eventManager,
      historyManager,
      inventoryManager,
      navigationManager,
      eventRunner,
      saveManager,
      settingsManager,
    });

    const spoken: string[] = [];
    callbacks.onSay = vi.fn((text: Record<string, string>) => spoken.push(text.en ?? Object.values(text)[0]));

    const events: VylosEvent[] = [
      {
        id: 'first',
        locked: () => true,
        async execute(api: VylosEventAPI) {
          await api.say('In first event');
          api.jump('second');
        },
      },
      {
        id: 'second',
        locked: () => true,
        async execute(api: VylosEventAPI) {
          await api.say('In second event');
        },
      },
    ];

    const runPromise = engine.run(events, callbacks.getState);

    // First event: "In first event"
    await vi.waitFor(() => expect(spoken).toContain('In first event'));
    eventRunner.resolveWait();

    // After jump, second event: "In second event"
    await vi.waitFor(() => expect(spoken).toContain('In second event'));
    eventRunner.resolveWait();

    await new Promise(r => setTimeout(r, 50));
    engine.stop();
    await runPromise;

    expect(spoken).toEqual(['In first event', 'In second event']);
    expect(historyManager.count).toBe(2);
  });
});

describe('Plugin system', () => {
  beforeEach(() => {
    clearComponentOverrides();
  });

  it('createEngine produces a working engine', () => {
    const callbacks = makeCallbacks();
    const engine = createEngine({ callbacks });
    expect(engine).toBeDefined();
    expect(engine.eventManager).toBeInstanceOf(EventManager);
    expect(engine.historyManager).toBeInstanceOf(HistoryManager);
    expect(engine.navigationManager).toBeInstanceOf(NavigationManager);
  });

  it('plugin setup receives inventoryManager', () => {
    let receivedContext: PluginContext | null = null;

    const plugin: VylosPlugin = {
      setup(context) {
        receivedContext = context;
      },
    };

    const callbacks = makeCallbacks();
    createEngine({ callbacks, plugin });
    expect(receivedContext).not.toBeNull();
    expect(receivedContext!.inventoryManager).toBeDefined();
  });

  it('plugin can register component overrides', () => {
    const CustomTopBar = defineComponent({ template: '<div>Custom</div>' });

    const plugin: VylosPlugin = {
      components: {
        TopBar: CustomTopBar,
      },
    };

    const callbacks = makeCallbacks();
    createEngine({ callbacks, plugin });
    expect(getComponentOverride('TopBar')).toBe(CustomTopBar);
    expect(getComponentOverride('NonExistent')).toBeUndefined();
  });
});
