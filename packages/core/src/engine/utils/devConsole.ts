import type { Engine } from '../core/Engine';
import type { VylosConfig } from '../types/config';
import type { VylosGameState } from '../types';

export interface VylosConsole {
  /** Current game state (read/write — changes are live) */
  readonly state: VylosGameState;
  /** Inventory shorthand */
  readonly inventory: {
    add(bag: string, itemId: string, qty?: number): number;
    remove(bag: string, itemId: string, qty?: number): number;
    has(bag: string, itemId: string, qty?: number): boolean;
    count(bag: string, itemId: string): number;
    list(bag: string): Array<[string, number]>;
    clear(bag: string): void;
  };
  /** Raw engine reference */
  readonly engine: Engine;
  /** Print engine debug snapshot to console */
  debug(): void;
}

declare global {
  interface Window {
    Vylos: VylosConsole;
  }
}

/** Print a styled banner and cheat guide to the browser console */
export function printBanner(config: VylosConfig): void {
  console.log(
    `%c${config.name}\n%c v${config.version}`,
    'font-size:2em;font-weight:bold;color:#7c3aed;',
    'font-size:0.9em;color:gray;',
  );

  console.log(
    `\n⚠ Cheats are not blocked, but bad values can break your save.\n\n` +
    `Type Vylos in console — state is a Vue reactive proxy.\n` +
    `Drill into nested objects directly, changes apply live.\n` +
    `In DevTools: expand Proxy → [[Target]] to see contents.\n\n` +
    `Vylos.state                              → Proxy {locationId, flags, inventories, ...}\n` +
    `Vylos.state.flags                        → Proxy {intro_done: true, ...}\n` +
    `Vylos.state.flags.intro_done = false     → changes apply live\n` +
    `Vylos.debug()                            → engine debug snapshot`,
  );
}

/** Attach a global console object for cheating/debugging */
export function attachDevConsole(engine: Engine, getState: () => VylosGameState, config: VylosConfig): void {
  const im = engine.inventoryManager;

  try {
    Object.defineProperty(window, 'Vylos', {
      configurable: true,
      get(): VylosConsole {
        const state = getState();
        return {
          state,
          inventory: {
            add: (bag: string, itemId: string, qty?: number) => im.add(state.inventories, bag, itemId, qty),
            remove: (bag: string, itemId: string, qty?: number) => im.remove(state.inventories, bag, itemId, qty),
            has: (bag: string, itemId: string, qty?: number) => im.has(state.inventories, bag, itemId, qty),
            count: (bag: string, itemId: string) => im.count(state.inventories, bag, itemId),
            list: (bag: string) => im.list(state.inventories, bag),
            clear: (bag: string) => im.clearBag(state.inventories, bag),
          },
          engine,
          debug() { engine.debugPrint(); },
        };
      },
    });
  } catch {
    console.warn('[Vylos] Could not attach dev console as window.Vylos');
  }

  printBanner(config);
}
