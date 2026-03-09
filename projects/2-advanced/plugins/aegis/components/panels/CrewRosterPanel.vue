<template>
  <div class="absolute top-[6cqh] right-[1cqw] w-[30cqw] max-h-[80cqh] bg-black/90 backdrop-blur-xl border border-cyan-500/20 rounded-[0.6cqw] pointer-events-auto overflow-hidden flex flex-col shadow-[0_0_30px_rgba(6,182,212,0.1)]">

    <!-- Header -->
    <div class="flex items-center justify-between px-[1.5cqw] py-[1cqh] border-b border-cyan-500/20">
      <span class="text-[1.3cqw] font-mono font-bold text-cyan-300 uppercase tracking-widest">Crew Roster</span>
      <button class="text-white/40 hover:text-white text-[1.5cqw] leading-none" @click="$emit('close')">x</button>
    </div>

    <!-- Crew Cards -->
    <div class="flex-1 overflow-y-auto p-[1cqw] flex flex-col gap-[1cqh] custom-scrollbar">
      <div
        v-for="member in crewList"
        :key="member.id"
        class="p-[1cqw] rounded-[0.4cqw] border border-white/10 bg-white/5"
      >
        <div class="flex items-center justify-between mb-[0.5cqh]">
          <span class="text-[1.2cqw] font-bold text-white">{{ member.name }}</span>
          <span class="text-[0.9cqw] font-mono uppercase px-[0.5cqw] py-[0.2cqh] rounded border"
            :class="statusClass(member.status)">{{ member.status }}</span>
        </div>

        <div class="text-[0.9cqw] text-white/50 mb-[0.5cqh] font-mono uppercase">{{ member.role }} — {{ member.location }}</div>

        <!-- Stress bar -->
        <div class="flex items-center gap-[0.5cqw] mb-[0.3cqh]">
          <span class="text-[0.8cqw] text-white/40 w-[5cqw] font-mono">STRESS</span>
          <div class="flex-1 h-[0.5cqh] bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="member.stress > 70 ? 'bg-red-500' : member.stress > 40 ? 'bg-amber-400' : 'bg-green-400'"
              :style="{ width: `${member.stress}%` }"
            ></div>
          </div>
          <span class="text-[0.8cqw] font-mono text-white/50 w-[3cqw] text-right">{{ member.stress }}</span>
        </div>

        <!-- Affinity bar -->
        <div class="flex items-center gap-[0.5cqw]">
          <span class="text-[0.8cqw] text-white/40 w-[5cqw] font-mono">TRUST</span>
          <div class="flex-1 h-[0.5cqh] bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div
              class="h-full bg-cyan-400 rounded-full transition-all duration-300"
              :style="{ width: `${member.affinity}%` }"
            ></div>
          </div>
          <span class="text-[0.8cqw] font-mono text-white/50 w-[3cqw] text-right">{{ member.affinity }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@game/gameState';

defineEmits<{ close: [] }>();

const gameStore = useGameStore();
const state = computed(() => gameStore.state);

const crewList = computed(() => [state.value.crews.jax, state.value.crews.elena, state.value.crews.kael]);

function statusClass(status: string) {
  switch (status) {
    case 'idle': return 'text-green-400 border-green-400/30';
    case 'working': return 'text-amber-400 border-amber-400/30';
    case 'injured': return 'text-red-400 border-red-400/30';
    case 'stressed_out': return 'text-orange-400 border-orange-400/30';
    default: return 'text-white/40 border-white/10';
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 10px; }
</style>
