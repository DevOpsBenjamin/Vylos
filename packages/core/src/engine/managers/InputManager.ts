import { logger } from '../utils/logger';

export type InputCallback = (action: string) => void;

type KeyboardLayout = 'unknown' | 'qwerty' | 'azerty';

/**
 * Manages keyboard and mouse input for the game.
 * Auto-detects QWERTY vs AZERTY layout on first relevant keypress.
 */
export class InputManager {
  private callback: InputCallback | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private skipMode = false;
  private layout: KeyboardLayout = 'unknown';

  /** Custom overrides set via setBinding() */
  private customBindings = new Map<string, string>();

  /** Start listening for input */
  start(callback: InputCallback): void {
    this.callback = callback;

    this.keyHandler = (e: KeyboardEvent) => {
      // Check custom bindings first
      const custom = this.customBindings.get(e.key);
      if (custom) {
        e.preventDefault();
        this.callback?.(custom);
        return;
      }

      const action = this.resolveAction(e);
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
    this.customBindings.set(key, action);
  }

  /** Get detected keyboard layout */
  get detectedLayout(): KeyboardLayout {
    return this.layout;
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

  /** Resolve a keyboard event to an action, with layout auto-detection */
  private resolveAction(e: KeyboardEvent): string | null {
    const key = e.key;

    // Universal keys (work on all layouts)
    if (key === ' ' || key === 'Enter') return 'continue';
    if (key === 'Escape') return 'menu';
    if (key === 'ArrowRight') return 'forward';
    if (key === 'ArrowLeft') return 'back';

    // Hide UI toggle (Ren'Py style)
    if (key === 'h' || key === 'H') return 'hide-ui';

    // Skip toggle — same key on both layouts
    if (key === 's' || key === 'S') return 'skip-toggle';

    // Forward / continue: D on both layouts, E on both layouts
    if (key === 'd' || key === 'D') return 'forward';
    if (key === 'e' || key === 'E') return 'continue';

    // Layout-dependent back key
    if (key === 'q' || key === 'Q') {
      this.detectLayout('qwerty');
      return 'back';
    }
    if (key === 'a' || key === 'A') {
      this.detectLayout('azerty');
      return 'back';
    }

    return null;
  }

  /** Auto-detect layout on first relevant keypress */
  private detectLayout(detected: 'qwerty' | 'azerty'): void {
    if (this.layout !== 'unknown') return;
    this.layout = detected;
    logger.debug(`Keyboard layout detected: ${detected}`);
  }
}
