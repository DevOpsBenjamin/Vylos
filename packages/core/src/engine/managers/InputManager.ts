import { logger } from '../utils/logger';

export type InputCallback = (action: string) => void;

/**
 * Manages keyboard and mouse input for the game.
 * Maps keys to engine actions (continue, skip, menu, etc.)
 */
export class InputManager {
  private callback: InputCallback | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private skipMode = false;

  /** Default key bindings */
  private bindings: Record<string, string> = {
    ' ': 'continue',
    'Enter': 'continue',
    'Escape': 'menu',
    'ArrowLeft': 'back',
    'ArrowRight': 'forward',
    's': 'skip-toggle',
  };

  /** Start listening for input */
  start(callback: InputCallback): void {
    this.callback = callback;

    this.keyHandler = (e: KeyboardEvent) => {
      const action = this.bindings[e.key];
      if (action) {
        e.preventDefault();
        this.callback?.(action);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.keyHandler);
      logger.debug('InputManager started');
    }
  }

  /** Stop listening */
  stop(): void {
    if (this.keyHandler && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.keyHandler);
    }
    this.keyHandler = null;
    this.callback = null;
    logger.debug('InputManager stopped');
  }

  /** Override a key binding */
  setBinding(key: string, action: string): void {
    this.bindings[key] = action;
  }

  /** Get skip mode state */
  get isSkipping(): boolean {
    return this.skipMode;
  }

  /** Toggle skip mode */
  toggleSkip(): void {
    this.skipMode = !this.skipMode;
    logger.debug(`Skip mode: ${this.skipMode}`);
  }

  /** Set skip mode */
  setSkip(enabled: boolean): void {
    this.skipMode = enabled;
  }
}
