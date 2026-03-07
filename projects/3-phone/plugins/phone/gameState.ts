import { deepMerge, type VylosGameState, type VylosGameStore } from '@vylos/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';

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

export interface Flags {
  booted: boolean;
  lookingForOwner: boolean;
  hasMysteriousMessage: boolean;
  firstNotifDone: boolean;
  galleryHint: boolean;
  foundPhoto: boolean;
  thoroughSearcher: boolean;
  photoReactionPending: boolean;
  unknownChatDone: boolean;
}

interface StoryState {
  chapter: number;
  mainQuestStep: number;
  sideQuests: Record<string, boolean>;
}

export interface GameState extends VylosGameState {
  phone: PhoneState;
  story: StoryState;
  flags: Flags;
}

function createFlags(): Flags {
  return {
    booted: false,
    lookingForOwner: false,
    hasMysteriousMessage: false,
    firstNotifDone: false,
    galleryHint: false,
    foundPhoto: false,
    thoroughSearcher: false,
    photoReactionPending: false,
    unknownChatDone: false,
  };
}

function createPhone(): PhoneState {
  return {
    battery: 100,
    signal: 3,
    currentApp: null,
    notifications: [],
    contacts: [],
    conversations: {},
    unlockedApps: ['messages', 'gallery', 'settings'],
    wallpaper: 'default',
  };
}

function createStory(): StoryState {
  return {
    chapter: 0,
    mainQuestStep: 0,
    sideQuests: {},
  };
}

export function createState(): GameState {
  return {
    locationId: 'homescreen',
    gameTime: 22.5,
    player: { id: 'player', name: 'Player' },
    inventories: {},
    phone: createPhone(),
    story: createStory(),
    flags: createFlags(),
  };
}

export const useGameStore = defineStore('gameState', () => {
  const state = ref<GameState>(createState());

  function getState(): GameState {
    return state.value;
  }

  function setState(newState: GameState) {
    state.value = deepMerge(createState(), newState) as GameState;
  }

  function getSnapshot(): GameState {
    return structuredClone(state.value);
  }

  function restoreSnapshot(snapshot: GameState) {
    state.value = deepMerge(createState(), snapshot) as GameState;
  }

  function $reset() {
    state.value = createState();
  }

  const store = { state, getState, setState, getSnapshot, restoreSnapshot, $reset };
  return store satisfies VylosGameStore;
});
