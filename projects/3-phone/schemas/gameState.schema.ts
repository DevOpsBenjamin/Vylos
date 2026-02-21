import { z } from 'zod';
import { extendGameStateSchema } from '@vylos/core';

const messageSchema = z.object({
  id: z.string(),
  from: z.string(),
  text: z.string(),
  timestamp: z.number(),
  read: z.boolean().default(false),
  choices: z.array(z.object({
    text: z.string(),
    value: z.string(),
  })).optional(),
});

const contactSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().default(''),
  unread: z.number().int().min(0).default(0),
  relationship: z.number().min(0).max(100).default(0),
  unlocked: z.boolean().default(false),
});

const notificationSchema = z.object({
  id: z.string(),
  app: z.string(),
  title: z.string(),
  body: z.string(),
  timestamp: z.number(),
  read: z.boolean().default(false),
});

export const gameStateSchema = extendGameStateSchema({
  phone: z.object({
    battery: z.number().min(0).max(100).default(85),
    signal: z.number().min(0).max(4).default(3),
    currentApp: z.string().nullable().default(null),
    notifications: z.array(notificationSchema).default([]),
    contacts: z.array(contactSchema).default([]),
    conversations: z.record(z.string(), z.array(messageSchema)).default({}),
    unlockedApps: z.array(z.string()).default(['messages', 'gallery', 'settings']),
    wallpaper: z.string().default('default'),
  }).default({}),
  story: z.object({
    chapter: z.number().int().min(0).default(0),
    mainQuestStep: z.number().int().min(0).default(0),
    sideQuests: z.record(z.string(), z.boolean()).default({}),
  }).default({}),
});

export type GameState = z.infer<typeof gameStateSchema>;
