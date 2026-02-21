/** Thrown by engine.end() to cleanly terminate the current event */
export class EventEndError extends Error {
  constructor() {
    super('Event ended');
    this.name = 'EventEndError';
  }
}
