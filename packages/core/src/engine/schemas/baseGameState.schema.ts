import { z } from 'zod';

/** Base game state schema — projects extend this with their own fields */
export const baseGameStateSchema = z.object({
  locationId: z.string().min(1),
  gameTime: z.number().nonnegative(),
  flags: z.record(z.string(), z.boolean()),
  counters: z.record(z.string(), z.number()),
  player: z.object({
    name: z.string().min(1),
  }),
  inventories: z.record(z.string(), z.record(z.string(), z.number().int().nonnegative())).default({}),
});

export type BaseGameStateFromSchema = z.infer<typeof baseGameStateSchema>;

/** Create an extended game state schema by merging with project-specific fields */
export function extendGameStateSchema<T extends z.ZodRawShape>(extension: T) {
  return baseGameStateSchema.extend(extension);
}
