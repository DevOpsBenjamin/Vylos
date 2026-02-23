/** Thrown by engine.jump() to transfer control to another event */
export class JumpSignal extends Error {
  readonly targetEventId: string;

  constructor(targetEventId: string) {
    super(`Jump to event: ${targetEventId}`);
    this.name = 'JumpSignal';
    this.targetEventId = targetEventId;
  }
}
