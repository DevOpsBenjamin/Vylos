<template>
  <div class="absolute top-[6cqh] right-[1cqw] w-[32cqw] max-h-[80cqh] bg-black/90 backdrop-blur-xl border border-cyan-500/20 rounded-[0.6cqw] pointer-events-auto overflow-hidden flex flex-col shadow-[0_0_30px_rgba(6,182,212,0.1)]">

    <!-- Header -->
    <div class="flex items-center justify-between px-[1.5cqw] py-[1cqh] border-b border-cyan-500/20">
      <span class="text-[1.3cqw] font-mono font-bold text-cyan-300 uppercase tracking-widest">Station Status</span>
      <button class="text-white/40 hover:text-white text-[1.5cqw] leading-none" @click="$emit('close')">x</button>
    </div>

    <!-- Module List -->
    <div class="flex-1 overflow-y-auto p-[1cqw] flex flex-col gap-[0.8cqh] custom-scrollbar">
      <div
        v-for="mod in moduleList"
        :key="mod.id"
        class="flex items-center gap-[1cqw] px-[1cqw] py-[0.8cqh] rounded-[0.4cqw] border bg-white/5"
        :class="mod.damaged ? 'border-red-500/30' : 'border-white/10'"
      >
        <!-- Status dot -->
        <div class="w-[0.8cqw] h-[0.8cqw] rounded-full shrink-0" :class="integrityDot(mod.integrity)"></div>

        <!-- Module info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-[1.1cqw] font-mono font-bold text-white uppercase truncate">{{ mod.id }}</span>
            <span v-if="mod.damaged" class="text-[0.8cqw] font-mono text-red-400 animate-pulse">DAMAGED</span>
            <span v-else-if="!mod.powered" class="text-[0.8cqw] font-mono text-amber-400">OFFLINE</span>
          </div>
          <!-- Integrity bar -->
          <div class="mt-[0.3cqh] w-full h-[0.5cqh] bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="integrityBar(mod.integrity)"
              :style="{ width: `${mod.integrity}%` }"
            ></div>
          </div>
        </div>

        <!-- Integrity value -->
        <span class="text-[1cqw] font-mono text-white/50 shrink-0 w-[3.5cqw] text-right">{{ mod.integrity }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@game/gameState';
import type { ModuleId } from '@game/gameState/stations';

defineEmits<{ close: [] }>();

const gameStore = useGameStore();
const modules = computed(() => gameStore.state.station.modules);

const MODULE_IDS: ModuleId[] = ['bridge', 'reactor', 'medbay', 'airlock', 'quarters'];

const moduleList = computed(() =>
  MODULE_IDS.map(id => ({ id, ...modules.value[id] }))
);

function integrityDot(integrity: number): string {
  if (integrity > 70) return 'bg-green-400';
  if (integrity > 30) return 'bg-amber-400';
  return 'bg-red-400 animate-pulse';
}

function integrityBar(integrity: number): string {
  if (integrity > 70) return 'bg-green-400';
  if (integrity > 30) return 'bg-amber-400';
  return 'bg-red-500';
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 10px; }
</style>
