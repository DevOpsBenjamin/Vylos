<template>
  <div
    class="relative border rounded-[0.6cqw] p-[1cqw] min-h-[12cqh] flex flex-col cursor-pointer transition-all duration-150"
    :class="slotClass"
    @click="handleClick"
  >
    <!-- Module header -->
    <div class="flex items-center justify-between mb-[0.5cqh]">
      <span class="text-[1.1cqw] font-mono font-bold uppercase" :class="module.damaged ? 'text-red-400' : 'text-cyan-300'">
        {{ module.id }}
      </span>
      <span class="text-[0.8cqw] font-mono text-white/40">{{ module.integrity }}%</span>
    </div>

    <!-- Integrity bar -->
    <div class="w-full h-[0.4cqh] bg-black/60 rounded-full overflow-hidden border border-white/10 mb-[0.8cqh]">
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="module.integrity > 70 ? 'bg-green-400' : module.integrity > 30 ? 'bg-amber-400' : 'bg-red-500'"
        :style="{ width: `${module.integrity}%` }"
      ></div>
    </div>

    <!-- Crew portraits -->
    <div class="flex-1 flex items-end gap-[0.5cqw]">
      <div
        v-for="crew in crewHere"
        :key="crew.id"
        class="flex flex-col items-center gap-[0.3cqh] cursor-pointer transition-all duration-150"
        :class="crew.id === selectedCrewId ? 'scale-110 ring-2 ring-amber-400 rounded-[0.4cqw]' : 'hover:scale-105'"
        @click.stop="$emit('selectCrew', crew.id)"
      >
        <img
          :src="crew.portrait"
          :alt="crew.name"
          class="w-[6cqw] h-[6cqw] rounded-full object-cover border-2"
          :class="statusBorder(crew.status)"
        />
        <span class="text-[0.9cqw] font-mono text-white/70 truncate max-w-[7cqw]">{{ crew.name }}</span>
      </div>
    </div>

    <!-- Drop hint when crew selected -->
    <div v-if="selectedCrewId && !hasSelectedCrew" class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span class="text-[1.2cqw] font-mono text-amber-300/50 animate-pulse">ASSIGN HERE</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CrewMember } from '@game/gameState/crews';

const props = defineProps<{
  module: { id: string; integrity: number; powered: boolean; damaged: boolean };
  crewHere: CrewMember[];
  selectedCrewId: string | null;
}>();

const emit = defineEmits<{
  selectCrew: [crewId: string];
  assignHere: [];
}>();

const hasSelectedCrew = computed(() =>
  props.crewHere.some(c => c.id === props.selectedCrewId)
);

const slotClass = computed(() => {
  if (props.selectedCrewId && !hasSelectedCrew.value) {
    return 'border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-400/60';
  }
  if (props.module.damaged) {
    return 'border-red-500/30 bg-red-500/5';
  }
  return 'border-white/10 bg-white/5 hover:border-cyan-500/30';
});

function handleClick() {
  if (props.selectedCrewId && !hasSelectedCrew.value) {
    emit('assignHere');
  }
}

function statusBorder(status: string): string {
  switch (status) {
    case 'idle': return 'border-green-400';
    case 'working': return 'border-amber-400';
    case 'injured': return 'border-red-400';
    case 'stressed_out': return 'border-orange-400';
    default: return 'border-white/20';
  }
}
</script>
