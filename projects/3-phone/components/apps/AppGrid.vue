<script setup lang="ts">
/**
 * AppGrid — Phone homescreen with app icons.
 * Each "app" maps to a Vylos location.
 */
import { computed } from 'vue';
import { useGameStateStore, useEngineStateStore } from '@vylos/core';

const gameState = useGameStateStore();
const engineState = useEngineStateStore();

interface AppDef {
  id: string;
  name: string;
  icon: string;
  locationId: string;
  badge?: number;
}

const apps = computed<AppDef[]>(() => {
  const phone = (gameState.state as Record<string, unknown>).phone as {
    unlockedApps?: string[];
    notifications?: Array<{ app: string; read: boolean }>;
  } | undefined;

  const unlocked = phone?.unlockedApps ?? ['messages', 'gallery', 'settings'];
  const notifications = phone?.notifications ?? [];

  const allApps: AppDef[] = [
    {
      id: 'messages',
      name: 'Messages',
      icon: '\uD83D\uDCAC',
      locationId: 'messages',
      badge: notifications.filter(n => n.app === 'messages' && !n.read).length,
    },
    {
      id: 'gallery',
      name: 'Photos',
      icon: '\uD83D\uDDBC\uFE0F',
      locationId: 'gallery',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: '\u2699\uFE0F',
      locationId: 'settings',
    },
    {
      id: 'dating',
      name: 'Meetr',
      icon: '\uD83D\uDC96',
      locationId: 'homescreen',
    },
    {
      id: 'news',
      name: 'News',
      icon: '\uD83D\uDCF0',
      locationId: 'homescreen',
    },
    {
      id: 'maps',
      name: 'Maps',
      icon: '\uD83D\uDDFA\uFE0F',
      locationId: 'homescreen',
    },
  ];

  return allApps.filter(a => unlocked.includes(a.id) || ['dating', 'news', 'maps'].includes(a.id));
});

const emit = defineEmits<{ 'open-app': [id: string] }>();
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Wallpaper area -->
    <div class="flex-1 flex items-center justify-center">
      <div class="text-6xl opacity-20">&#128241;</div>
    </div>

    <!-- App grid -->
    <div class="grid grid-cols-4 gap-4 p-6 pb-4">
      <button
        v-for="app in apps"
        :key="app.id"
        class="flex flex-col items-center gap-1 group"
        @click="emit('open-app', app.id)"
      >
        <!-- Icon container -->
        <div class="relative w-14 h-14 bg-gray-800/80 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-gray-700/80 transition-colors">
          {{ app.icon }}
          <!-- Badge -->
          <div
            v-if="app.badge && app.badge > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center"
          >
            {{ app.badge > 9 ? '9+' : app.badge }}
          </div>
        </div>
        <!-- Label -->
        <span class="text-[10px] text-white/70">{{ app.name }}</span>
      </button>
    </div>

    <!-- Dock placeholder -->
    <div class="h-16 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-8 px-6 mx-2 rounded-t-2xl">
      <span class="text-2xl opacity-60">&#128222;</span>
      <span class="text-2xl opacity-60">&#128247;</span>
      <span class="text-2xl opacity-60">&#127925;</span>
      <span class="text-2xl opacity-60">&#128187;</span>
    </div>
  </div>
</template>
