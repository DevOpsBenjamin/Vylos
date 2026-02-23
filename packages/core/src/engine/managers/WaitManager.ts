/**
 * Generic promise-based wait mechanism.
 * Creates a promise that external code can resolve (e.g., UI click handlers).
 */
export class WaitManager {
  private resolveFunc: ((value: unknown) => void) | null = null;
  private rejectFunc: ((reason: unknown) => void) | null = null;

  /** Whether a wait is currently active */
  get isWaiting(): boolean {
    return this.resolveFunc !== null;
  }

  /** Create a new wait and return a promise that resolves when resolve() is called */
  wait<T = void>(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.resolveFunc = resolve as (value: unknown) => void;
      this.rejectFunc = reject;
    });
  }

  /** Resolve the current wait with a value */
  resolve(value?: unknown): void {
    if (this.resolveFunc) {
      const fn = this.resolveFunc;
      this.resolveFunc = null;
      this.rejectFunc = null;
      fn(value);
    }
  }

  /** Reject the current wait with an error */
  reject(reason?: unknown): void {
    if (this.rejectFunc) {
      const fn = this.rejectFunc;
      this.resolveFunc = null;
      this.rejectFunc = null;
      fn(reason);
    }
  }

  /** Cancel any pending wait */
  cancel(): void {
    this.resolveFunc = null;
    this.rejectFunc = null;
  }
}
