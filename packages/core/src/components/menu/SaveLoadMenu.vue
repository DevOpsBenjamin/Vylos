<template>
  <div class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" @click.self="engineState.closeMenu()">
    <div class="bg-gray-900 border border-white/20 rounded-lg w-full max-w-2xl p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex gap-2">
          <button
            class="px-4 py-1 text-sm rounded transition-colors"
            :class="activeTab === 'save' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'"
            @click="activeTab = 'save'"
          >
            Save
          </button>
          <button
            class="px-4 py-1 text-sm rounded transition-colors"
            :class="activeTab === 'load' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'"
            @click="activeTab = 'load'"
          >
            Load
          </button>
        </div>
        <button class="text-white/50 hover:text-white text-xl" @click="engineState.closeMenu()">&times;</button>
      </div>

      <!-- Slot grid -->
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="slot in slots"
          :key="slot"
          class="aspect-video border border-white/20 rounded flex flex-col items-center justify-center gap-1 hover:border-white/50 hover:bg-white/5 transition-colors text-white/70 text-xs"
          @click="handleSlot(slot)"
        >
          <div class="text-lg">&#128190;</div>
          <div class="font-mono">Slot {{ slot }}</div>
          <div v-if="slotMeta[slot]" class="text-white/40 text-xs">
            {{ formatTime(slotMeta[slot]!.timestamp) }}
          </div>
          <div v-else class="text-white/30 italic">Empty</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { useGameStateStore } from '../../stores/gameState';
import { ENGINE_INJECT_KEY } from '../../composables/useEngine';
import type { Engine } from '../../engine/core/Engine';
import type { SaveMeta } from '../../engine/types';

const engine = inject<Engine>(ENGINE_INJECT_KEY);
const engineState = useEngineStateStore();
const gameState = useGameStateStore();

const SLOT_COUNT = 9;
const activeTab = ref<'save' | 'load'>('save');
const slots = Array.from({ length: SLOT_COUNT }, (_, i) => i + 1);
const slotMeta = ref<Record<number, SaveMeta>>({});

async function refreshSlots(): Promise<void> {
  if (!engine) return;
  const list = await engine.saveManager.listSlots();
  const map: Record<number, SaveMeta> = {};
  for (const meta of list) {
    map[meta.slot] = meta;
  }
  slotMeta.value = map;
}

onMounted(refreshSlots);

async function handleSlot(slot: number): Promise<void> {
  if (!engine) return;
  if (activeTab.value === 'save') {
    await engine.saveManager.save(slot, gameState.state, engineState.currentLocationId, 0);
    await refreshSlots();
  } else {
    const data = await engine.saveManager.load(slot);
    if (data) {
      gameState.setState(data.gameState);
      if (data.gameState.locationId) {
        engineState.setLocation(data.gameState.locationId);
      }
      engineState.closeMenu();
    }
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
</script>
