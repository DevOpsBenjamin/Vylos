<template>
  <div v-if="!engineState.dialogue && !engineState.choices && availableLocations.length > 0"
    class="absolute right-0 bottom-0 w-[22cqw] max-h-[60cqh] bg-black/80 backdrop-blur-xl border-l border-t border-cyan-500/15 flex flex-col pointer-events-auto z-20 rounded-tl-[0.6cqw]">

    <!-- Header -->
    <div class="px-[1.5cqw] py-[0.8cqh] border-b border-cyan-500/15 shrink-0">
      <span class="text-[1.2cqw] font-mono font-bold text-blue-400/80 uppercase tracking-widest">Modules</span>
    </div>

    <!-- Location List -->
    <div class="flex-1 overflow-y-auto p-[1cqw] flex flex-col gap-[0.6cqh] custom-scrollbar">
      <button
        v-for="location in availableLocations"
        :key="location.id"
        :disabled="!location.accessible"
        class="w-full text-left px-[1.2cqw] py-[0.8cqh] border rounded-[0.4cqw] text-[1.1cqw] font-mono transition-all duration-150"
        :class="location.accessible
          ? 'border-white/10 bg-white/5 text-white hover:border-blue-400/40 hover:bg-blue-500/10 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] active:scale-[0.97] cursor-pointer'
          : 'border-white/5 bg-black/20 text-white/30 cursor-not-allowed'"
        @click="location.accessible ? engine?.navigationManager.selectLocation(location.id) : null"
      >
        <div class="flex items-center gap-[0.6cqw]">
          <div class="w-[0.6cqw] h-[0.6cqw] rounded-full shrink-0" :class="moduleStatusDot(location.id)"></div>
          <span class="truncate">{{ resolveText(location.name) }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useEngineStateStore, ENGINE_INJECT_KEY, useLanguage } from '@vylos/core';
import type { Engine } from '@vylos/core';
import { useGameStore } from '@game/gameState';
import type { ModuleId } from '@game/gameState/stations';

const engineState = useEngineStateStore();
const engine = inject<Engine>(ENGINE_INJECT_KEY);
const { resolveText } = useLanguage();
const gameStore = useGameStore();

const availableLocations = computed(() => engineState.availableLocations);

function moduleStatusDot(locationId: string): string {
  const modules = gameStore.state.station.modules;
  const mod = modules[locationId as ModuleId];
  if (!mod) return 'bg-gray-400';
  if (mod.damaged) return 'bg-red-400 animate-pulse';
  if (mod.integrity < 50) return 'bg-amber-400';
  return 'bg-green-400';
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); border-radius: 10px; }
</style>
