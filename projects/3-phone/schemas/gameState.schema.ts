import type { BaseGameState } from '@vylos/core';

interface MessageChoice {
  text: string;
  value: string;
}

interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: number;
  read: boolean;
  choices?: MessageChoice[];
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  unread: number;
  relationship: number;
  unlocked: boolean;
}

interface Notification {
  id: string;
  app: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

interface PhoneState {
  battery: number;
  signal: number;
  currentApp: string | null;
  notifications: Notification[];
  contacts: Contact[];
  conversations: Record<string, Message[]>;
  unlockedApps: string[];
  wallpaper: string;
}

interface StoryState {
  chapter: number;
  mainQuestStep: number;
  sideQuests: Record<string, boolean>;
}

export interface GameState extends BaseGameState {
  phone: PhoneState;
  story: StoryState;
}
