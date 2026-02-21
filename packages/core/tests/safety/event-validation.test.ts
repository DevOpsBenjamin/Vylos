import { describe, it, expect } from 'vitest';
import { baseGameStateSchema, extendGameStateSchema } from '../../src/engine/schemas/baseGameState.schema';
import { StateValidationError } from '../../src/engine/errors/StateValidationError';
import { z } from 'zod';

/**
 * Tests for the Zod validation gate that runs after event execution.
 * The engine validates state after each event to prevent corruption.
 */
describe('Event validation gate', () => {
  function validateState(schema: z.ZodSchema, state: unknown): { valid: boolean; error?: StateValidationError } {
    const result = schema.safeParse(state);
    if (result.success) return { valid: true };
    return { valid: false, error: new StateValidationError(result.error) };
  }

  it('accepts valid state after event execution', () => {
    const state = {
      locationId: 'cafe',
      gameTime: 14,
      flags: { intro_done: true },
      counters: { coffee: 1 },
      player: { name: 'Alice' },
    };

    const { valid } = validateState(baseGameStateSchema, state);
    expect(valid).toBe(true);
  });

  it('rejects state with corrupted locationId', () => {
    const state = {
      locationId: '',
      gameTime: 14,
      flags: {},
      counters: {},
      player: { name: 'Alice' },
    };

    const { valid, error } = validateState(baseGameStateSchema, state);
    expect(valid).toBe(false);
    expect(error?.message).toContain('locationId');
  });

  it('rejects state with wrong type for flags', () => {
    const state = {
      locationId: 'cafe',
      gameTime: 14,
      flags: 'not-an-object',
      counters: {},
      player: { name: 'Alice' },
    };

    const { valid } = validateState(baseGameStateSchema, state);
    expect(valid).toBe(false);
  });

  it('validates extended project schema', () => {
    const projectSchema = extendGameStateSchema({
      reputation: z.number().min(0).max(100),
      inventory: z.array(z.string()),
      npcRelations: z.record(z.string(), z.number().min(-100).max(100)),
    });

    // Simulates an event that correctly modified state
    const goodState = {
      locationId: 'cafe',
      gameTime: 14,
      flags: { intro_done: true },
      counters: {},
      player: { name: 'Alice' },
      reputation: 50,
      inventory: ['map', 'key'],
      npcRelations: { barista: 10, landlord: -5 },
    };
    expect(validateState(projectSchema, goodState).valid).toBe(true);

    // Simulates a buggy event that set reputation to 150
    const badState = { ...goodState, reputation: 150 };
    const result = validateState(projectSchema, badState);
    expect(result.valid).toBe(false);
    expect(result.error?.message).toContain('reputation');
  });

  it('rejects prototype pollution attempts', () => {
    const state = {
      locationId: 'cafe',
      gameTime: 14,
      flags: {},
      counters: {},
      player: { name: 'Alice' },
      __proto__: { isAdmin: true },
    };

    // Zod parses with structuredClone behavior, __proto__ not a valid field
    const result = baseGameStateSchema.safeParse(state);
    // Should either succeed (ignoring __proto__) or fail — both are safe
    // The important thing is that isAdmin is NOT in the result
    if (result.success) {
      expect((result.data as Record<string, unknown>)['isAdmin']).toBeUndefined();
    }
  });
});
