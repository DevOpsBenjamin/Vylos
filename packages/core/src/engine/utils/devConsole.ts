import type { Engine } from '../core/Engine';
import type { VylosGameState } from '../types';
import { logger } from './logger';

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

/** Attach a global console object for cheating/debugging */
export function attachDevConsole(engine: Engine, getState: () => VylosGameState, consoleName = 'Vylos'): void {
  const im = engine.inventoryManager;

  Object.defineProperty(window, consoleName, {
    configurable: true,
    get() {
      const state = getState();
      return {
        get state() { return state; },
        get inventory() {
          return {
            add: (bag: string, itemId: string, qty?: number) => im.add(state.inventories, bag, itemId, qty),
            remove: (bag: string, itemId: string, qty?: number) => im.remove(state.inventories, bag, itemId, qty),
            has: (bag: string, itemId: string, qty?: number) => im.has(state.inventories, bag, itemId, qty),
            count: (bag: string, itemId: string) => im.count(state.inventories, bag, itemId),
            list: (bag: string) => im.list(state.inventories, bag),
            clear: (bag: string) => im.clearBag(state.inventories, bag),
          };
        },
        get engine() { return engine; },
        debug() { engine.debugPrint(); },
      };
    },
  });

  logger.info(`DevConsole ready — type ${consoleName} in the browser console`);
}
