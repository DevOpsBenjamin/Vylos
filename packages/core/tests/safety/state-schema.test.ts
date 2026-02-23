import { describe, it, expect } from 'vitest';
import { baseGameStateSchema, extendGameStateSchema } from '../../src/engine/schemas/baseGameState.schema';
import { StateValidationError } from '../../src/engine/errors/StateValidationError';
import { z } from 'zod';

describe('State validation safety', () => {
  it('catches type coercion attempts', () => {
    const result = baseGameStateSchema.safeParse({
      locationId: 123,  // should be string
      gameTime: '8',    // should be number
      flags: {},
      counters: {},
      player: { name: 'Alice' },
    });
    expect(result.success).toBe(false);
  });

  it('catches extra properties in strict mode', () => {
    const strict = baseGameStateSchema.strict();
    const result = strict.safeParse({
      locationId: 'cafe',
      gameTime: 8,
      flags: {},
      counters: {},
      player: { name: 'Alice' },
      hacked: true,
    });
    expect(result.success).toBe(false);
  });

  it('StateValidationError formats issues nicely', () => {
    const result = baseGameStateSchema.safeParse({
      locationId: '',
      gameTime: -1,
      flags: {},
      counters: {},
      player: { name: '' },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const error = new StateValidationError(result.error);
      expect(error.message).toContain('State validation failed');
      expect(error.name).toBe('StateValidationError');
      expect(error.zodError).toBe(result.error);
    }
  });

  it('validates extended schema rejects base-only data', () => {
    const schema = extendGameStateSchema({
      reputation: z.number().min(0).max(100),
    });

    const result = schema.safeParse({
      locationId: 'cafe',
      gameTime: 8,
      flags: {},
      counters: {},
      player: { name: 'Alice' },
      // missing reputation
    });
    expect(result.success).toBe(false);
  });

  it('validates extended schema accepts complete data', () => {
    const schema = extendGameStateSchema({
      reputation: z.number().min(0).max(100),
    });

    const result = schema.safeParse({
      locationId: 'cafe',
      gameTime: 8,
      flags: {},
      counters: {},
      player: { name: 'Alice' },
      reputation: 50,
    });
    expect(result.success).toBe(true);
  });

  it('validates extended schema rejects out-of-range custom field', () => {
    const schema = extendGameStateSchema({
      reputation: z.number().min(0).max(100),
    });

    const result = schema.safeParse({
      locationId: 'cafe',
      gameTime: 8,
      flags: {},
      counters: {},
      player: { name: 'Alice' },
      reputation: 150,
    });
    expect(result.success).toBe(false);
  });
});
