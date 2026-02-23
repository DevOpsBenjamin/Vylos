import type { ZodError } from 'zod';

/** Thrown when state fails Zod validation after event execution */
export class StateValidationError extends Error {
  readonly zodError: ZodError;

  constructor(zodError: ZodError) {
    const issues = zodError.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    super(`State validation failed: ${issues}`);
    this.name = 'StateValidationError';
    this.zodError = zodError;
  }
}
