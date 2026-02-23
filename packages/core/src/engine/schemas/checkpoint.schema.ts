import { z } from 'zod';
import { baseGameStateSchema } from './baseGameState.schema';

export const checkpointSchema = z.object({
  step: z.number().int().nonnegative(),
  gameState: baseGameStateSchema,
  type: z.enum(['say', 'choice', 'wait', 'overlay']),
  choiceResult: z.string().optional(),
});

export type CheckpointFromSchema = z.infer<typeof checkpointSchema>;
