import { z } from 'zod';

const dialogueStateSchema = z.object({
  text: z.string(),
  speaker: z.string().nullable(),
  isNarration: z.boolean(),
});

const choiceOptionSchema = z.object({
  text: z.string(),
  value: z.string(),
  disabled: z.boolean().optional(),
});

const choiceStateSchema = z.object({
  prompt: z.string().nullable(),
  options: z.array(choiceOptionSchema),
});

const actionEntrySchema = z.object({
  id: z.string(),
  label: z.string(),
  locationId: z.string(),
});

const locationEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  accessible: z.boolean(),
});

export const engineStateSchema = z.object({
  phase: z.enum(['created', 'loading', 'main_menu', 'running', 'paused']),
  background: z.string().nullable(),
  foreground: z.string().nullable(),
  dialogue: dialogueStateSchema.nullable(),
  choices: choiceStateSchema.nullable(),
  currentLocationId: z.string().nullable(),
  availableActions: z.array(actionEntrySchema),
  availableLocations: z.array(locationEntrySchema),
  menuOpen: z.enum(['save_load', 'settings']).nullable(),
  skipMode: z.boolean(),
  autoMode: z.boolean(),
});

export type EngineStateFromSchema = z.infer<typeof engineStateSchema>;

export const engineSettingsSchema = z.object({
  textSpeed: z.number().min(0).max(1),
  autoSpeed: z.number().min(0).max(1),
  volume: z.object({
    master: z.number().min(0).max(1),
    music: z.number().min(0).max(1),
    sfx: z.number().min(0).max(1),
    voice: z.number().min(0).max(1),
  }),
  language: z.string().min(1),
  fullscreen: z.boolean(),
});
