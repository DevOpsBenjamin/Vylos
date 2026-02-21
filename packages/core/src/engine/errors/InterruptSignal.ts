/** Thrown when engine needs to interrupt event execution (e.g., load game) */
export class InterruptSignal extends Error {
  readonly reason: string;

  constructor(reason: string) {
    super(`Event interrupted: ${reason}`);
    this.name = 'InterruptSignal';
    this.reason = reason;
  }
}
