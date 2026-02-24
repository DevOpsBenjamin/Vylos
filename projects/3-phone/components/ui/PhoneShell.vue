<script setup lang="ts">
/**
 * PhoneShell — Replaces the default GameShell.
 * Renders the game inside a phone-shaped viewport with rounded corners,
 * a status bar, and a home indicator.
 */
import { useEngineStateStore } from '@vylos/core';
import PhoneTopBar from './PhoneTopBar.vue';
import PhoneDialogue from './PhoneDialogue.vue';
import AppGrid from '../apps/AppGrid.vue';

const engineState = useEngineStateStore();
</script>

<template>
  <div class="w-full h-full bg-gray-950 flex items-center justify-center">
    <!-- Phone frame -->
    <div class="relative w-[390px] h-[844px] max-h-[95vh] bg-black rounded-[3rem] border-4 border-gray-800 shadow-2xl overflow-hidden flex flex-col">
      <!-- Status bar -->
      <PhoneTopBar />

      <!-- Screen content -->
      <div class="flex-1 overflow-hidden relative bg-gray-900">
        <!-- Active dialogue (chat-style) -->
        <PhoneDialogue v-if="engineState.dialogue" />

        <!-- Choice overlay -->
        <div
          v-else-if="engineState.choices"
          class="absolute inset-0 flex flex-col items-center justify-end p-4 pb-8 gap-2"
        >
          <button
            v-for="option in engineState.choices.options"
            :key="option.value"
            :disabled="option.disabled"
            class="w-full max-w-xs py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-2xl text-sm font-medium transition-colors"
          >
            {{ option.text }}
          </button>
        </div>

        <!-- App grid (homescreen) -->
        <AppGrid v-else />
      </div>

      <!-- Home indicator -->
      <div class="h-8 bg-black flex items-center justify-center">
        <div class="w-32 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  </div>
</template>
