import { z } from 'zod';

const backgroundEntrySchema = z.object({
  path: z.string().min(1),
  timeRange: z.tuple([z.number(), z.number()]).optional(),
});

export const locationSchema = z.object({
  id: z.string().min(1),
  name: z.union([z.string(), z.record(z.string(), z.string())]),
  backgrounds: z.array(backgroundEntrySchema),
});

export type LocationFromSchema = z.infer<typeof locationSchema>;

export const locationLinkSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});

export type LocationLinkFromSchema = z.infer<typeof locationLinkSchema>;
