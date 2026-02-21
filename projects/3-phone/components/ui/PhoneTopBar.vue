<script setup lang="ts">
/**
 * PhoneTopBar — Phone-style status bar with time, battery, signal.
 * Replaces the default TopBar.
 */
import { computed } from 'vue';
import { useGameStateStore } from '@vylos/core';

const gameState = useGameStateStore();

const timeDisplay = computed(() => {
  const t = gameState.state.gameTime;
  const h = Math.floor(t % 24);
  const m = Math.floor((t % 1) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
});

const phone = computed(() => (gameState.state as Record<string, unknown>).phone as {
  battery: number;
  signal: number;
} | undefined);

const battery = computed(() => phone.value?.battery ?? 85);
const signal = computed(() => phone.value?.signal ?? 3);

const signalDots = computed(() => {
  const s = signal.value;
  return Array.from({ length: 4 }, (_, i) => i < s);
});
</script>

<template>
  <div class="h-12 bg-black/90 flex items-center justify-between px-6 text-white text-xs font-medium shrink-0">
    <!-- Time -->
    <span class="text-sm font-semibold">{{ timeDisplay }}</span>

    <!-- Right side: signal + battery -->
    <div class="flex items-center gap-2">
      <!-- Signal bars -->
      <div class="flex gap-0.5 items-end h-3">
        <div
          v-for="(active, i) in signalDots"
          :key="i"
          :class="['w-1 rounded-sm', active ? 'bg-white' : 'bg-gray-600']"
          :style="{ height: `${(i + 1) * 25}%` }"
        ></div>
      </div>

      <!-- Battery -->
      <div class="flex items-center gap-1">
        <div class="w-6 h-3 border border-white/60 rounded-sm relative">
          <div
            class="absolute inset-0.5 rounded-xs transition-all"
            :class="battery > 20 ? 'bg-green-400' : 'bg-red-400'"
            :style="{ width: `${battery}%` }"
          ></div>
        </div>
        <span class="text-[10px] text-white/60">{{ battery }}%</span>
      </div>
    </div>
  </div>
</template>
