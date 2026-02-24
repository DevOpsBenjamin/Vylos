import { z } from 'zod';
import { extendGameStateSchema } from '@vylos/core';

const npcSchema = z.object({
  affection: z.number().min(0).max(100).default(0),
  met: z.boolean().default(false),
  dates: z.number().int().min(0).default(0),
  events: z.array(z.string()).default([]),
});

export const gameStateSchema = extendGameStateSchema({
  energy: z.number().min(0).max(100).default(100),
  charm: z.number().min(0).max(100).default(20),
  day: z.number().int().min(1).default(1),
  npcs: z.object({
    maya: npcSchema.default({}),
    lena: npcSchema.default({}),
  }).default({}),
  inventory: z.array(z.string()).default([]),
});

export type GameState = z.infer<typeof gameStateSchema>;
