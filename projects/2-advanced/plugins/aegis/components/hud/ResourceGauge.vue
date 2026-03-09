<template>
  <div class="flex flex-col items-center gap-[0.3cqh] min-w-[8cqw]">
    <span
      class="text-[0.9cqw] font-mono font-bold uppercase tracking-widest"
      :class="critical ? 'text-red-400 animate-pulse' : labelColor"
    >{{ label }}</span>
    <div class="w-full h-[0.6cqh] bg-black/60 rounded-full overflow-hidden border" :class="borderColor">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="[barColor, critical ? 'animate-pulse' : '']"
        :style="{ width: `${pct}%` }"
      ></div>
    </div>
    <span class="text-[1cqw] font-mono" :class="critical ? 'text-red-300' : 'text-white/70'">
      {{ value }} / {{ max }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  value: number;
  max: number;
  color: 'cyan' | 'amber' | 'emerald';
  critical?: boolean;
}>();

const pct = computed(() => Math.round((props.value / props.max) * 100));

const colorMap = {
  cyan:    { label: 'text-cyan-400/70',   bar: 'bg-cyan-400',    border: 'border-cyan-500/30' },
  amber:   { label: 'text-amber-400/70',  bar: 'bg-amber-400',   border: 'border-amber-500/30' },
  emerald: { label: 'text-emerald-400/70', bar: 'bg-emerald-400', border: 'border-emerald-500/30' },
};

const labelColor = computed(() => colorMap[props.color].label);
const barColor = computed(() => props.critical ? 'bg-red-500' : colorMap[props.color].bar);
const borderColor = computed(() => props.critical ? 'border-red-500/40' : colorMap[props.color].border);
</script>
