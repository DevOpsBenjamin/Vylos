<template>
  <div class="flex items-center gap-[0.5cqw] px-[0.8cqw] py-[0.4cqh] rounded-[0.4cqw] bg-black/40 border" :class="borderClass">
    <div class="w-[0.6cqw] h-[0.6cqw] rounded-full" :class="dotClass"></div>
    <span class="text-[1cqw] font-mono text-white/80">{{ crew.name }}</span>
    <span class="text-[0.8cqw] text-white/40 uppercase">{{ crew.location }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CrewMember } from '@game/gameState/crews';

const props = defineProps<{ crew: CrewMember }>();

const dotClass = computed(() => {
  switch (props.crew.status) {
    case 'idle': return 'bg-green-400';
    case 'working': return 'bg-amber-400';
    case 'injured': return 'bg-red-400 animate-pulse';
    case 'stressed_out': return 'bg-orange-400 animate-pulse';
    default: return 'bg-gray-400';
  }
});

const borderClass = computed(() => {
  if (props.crew.stress > 70) return 'border-red-500/30';
  if (props.crew.stress > 40) return 'border-amber-500/20';
  return 'border-cyan-500/10';
});
</script>
