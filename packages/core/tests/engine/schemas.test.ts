import { describe, it, expect } from 'vitest';
import { baseGameStateSchema, extendGameStateSchema } from '../../src/engine/schemas/baseGameState.schema';
import { engineStateSchema, engineSettingsSchema } from '../../src/engine/schemas/engineState.schema';
import { checkpointSchema } from '../../src/engine/schemas/checkpoint.schema';
import { locationSchema, locationLinkSchema } from '../../src/engine/schemas/location.schema';
import { z } from 'zod';

describe('baseGameStateSchema', () => {
  const validState = {
    locationId: 'bedroom',
    gameTime: 8,
    flags: { intro_done: true },
    counters: { coffee_count: 2 },
    player: { name: 'Alice' },
    inventories: {},
  };

  it('validates a correct base game state', () => {
    const result = baseGameStateSchema.safeParse(validState);
    expect(result.success).toBe(true);
  });

  it('rejects empty locationId', () => {
    const result = baseGameStateSchema.safeParse({ ...validState, locationId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects negative gameTime', () => {
    const result = baseGameStateSchema.safeParse({ ...validState, gameTime: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects empty player name', () => {
    const result = baseGameStateSchema.safeParse({
      ...validState,
      player: { name: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = baseGameStateSchema.safeParse({ locationId: 'test' });
    expect(result.success).toBe(false);
  });
});

describe('extendGameStateSchema', () => {
  it('extends base schema with custom fields', () => {
    const extended = extendGameStateSchema({
      reputation: z.number(),
      inventory: z.array(z.string()),
    });

    const result = extended.safeParse({
      locationId: 'cafe',
      gameTime: 14,
      flags: {},
      counters: {},
      player: { name: 'Bob' },
      reputation: 50,
      inventory: ['key', 'map'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects extended state missing custom fields', () => {
    const extended = extendGameStateSchema({
      reputation: z.number(),
    });

    const result = extended.safeParse({
      locationId: 'cafe',
      gameTime: 14,
      flags: {},
      counters: {},
      player: { name: 'Bob' },
      // missing reputation
    });
    expect(result.success).toBe(false);
  });
});

describe('engineStateSchema', () => {
  const validEngineState = {
    phase: 'created',
    background: null,
    foreground: null,
    dialogue: null,
    choices: null,
    currentLocationId: null,
    availableActions: [],
    availableLocations: [],
    menuOpen: null,
    skipMode: false,
    autoMode: false,
  };

  it('validates initial engine state', () => {
    const result = engineStateSchema.safeParse(validEngineState);
    expect(result.success).toBe(true);
  });

  it('validates engine state with dialogue', () => {
    const result = engineStateSchema.safeParse({
      ...validEngineState,
      phase: 'running',
      dialogue: { text: 'Hello', speaker: { id: 'alice', name: 'Alice' }, isNarration: false },
    });
    expect(result.success).toBe(true);
  });

  it('validates engine state with choices', () => {
    const result = engineStateSchema.safeParse({
      ...validEngineState,
      phase: 'running',
      choices: {
        prompt: null,
        options: [
          { text: 'Yes', value: 'yes' },
          { text: 'No', value: 'no' },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid phase', () => {
    const result = engineStateSchema.safeParse({
      ...validEngineState,
      phase: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});

describe('engineSettingsSchema', () => {
  it('validates default settings', () => {
    const result = engineSettingsSchema.safeParse({
      textSpeed: 0.5,
      autoSpeed: 0.5,
      volume: { master: 1, music: 0.8, sfx: 0.8, voice: 1 },
      language: 'en',
      fullscreen: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects volume out of range', () => {
    const result = engineSettingsSchema.safeParse({
      textSpeed: 0.5,
      autoSpeed: 0.5,
      volume: { master: 1.5, music: 0.8, sfx: 0.8, voice: 1 },
      language: 'en',
      fullscreen: false,
    });
    expect(result.success).toBe(false);
  });
});

describe('checkpointSchema', () => {
  it('validates a say checkpoint', () => {
    const result = checkpointSchema.safeParse({
      step: 0,
      gameState: {
        locationId: 'cafe',
        gameTime: 14,
        flags: {},
        counters: {},
        player: { name: 'Alice' },
      },
      type: 'say',
    });
    expect(result.success).toBe(true);
  });

  it('validates a choice checkpoint with result', () => {
    const result = checkpointSchema.safeParse({
      step: 1,
      gameState: {
        locationId: 'cafe',
        gameTime: 14,
        flags: {},
        counters: {},
        player: { name: 'Alice' },
      },
      type: 'choice',
      choiceResult: 'coffee',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative step number', () => {
    const result = checkpointSchema.safeParse({
      step: -1,
      gameState: {
        locationId: 'cafe',
        gameTime: 14,
        flags: {},
        counters: {},
        player: { name: 'Alice' },
      },
      type: 'say',
    });
    expect(result.success).toBe(false);
  });
});

describe('locationSchema', () => {
  it('validates a location with backgrounds', () => {
    const result = locationSchema.safeParse({
      id: 'cafe',
      name: 'The Cafe',
      backgrounds: [
        { path: '/assets/cafe_day.jpg', timeRange: [6, 18] },
        { path: '/assets/cafe_night.jpg', timeRange: [18, 6] },
        { path: '/assets/cafe_default.jpg' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('validates a location with i18n name', () => {
    const result = locationSchema.safeParse({
      id: 'cafe',
      name: { en: 'The Cafe', fr: 'Le Café' },
      backgrounds: [{ path: '/assets/cafe.jpg' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty location id', () => {
    const result = locationSchema.safeParse({
      id: '',
      name: 'Test',
      backgrounds: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('locationLinkSchema', () => {
  it('validates a link', () => {
    const result = locationLinkSchema.safeParse({ from: 'bedroom', to: 'hallway' });
    expect(result.success).toBe(true);
  });

  it('rejects empty from', () => {
    const result = locationLinkSchema.safeParse({ from: '', to: 'hallway' });
    expect(result.success).toBe(false);
  });
});
