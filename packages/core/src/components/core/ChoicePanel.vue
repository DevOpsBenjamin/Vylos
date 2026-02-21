<template>
  <Transition name="choice-fade">
    <div
      v-if="engineState.choices"
      class="absolute inset-0 z-35 flex flex-col items-center justify-center bg-black/40 px-8"
    >
      <p
        v-if="engineState.choices.prompt"
        class="text-white text-lg font-semibold mb-6 text-center"
      >
        {{ engineState.choices.prompt }}
      </p>

      <div class="flex flex-col gap-3 w-full max-w-xl">
        <button
          v-for="option in engineState.choices.options"
          :key="option.value"
          :disabled="option.disabled"
          class="px-6 py-3 bg-black/70 border border-white/30 text-white text-base text-left rounded hover:bg-white/10 hover:border-white/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          @click="engine?.eventRunner.resolveWait(option.value)"
        >
          {{ option.text }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { ENGINE_INJECT_KEY } from '../../composables/useEngine';
import type { Engine } from '../../engine/core/Engine';

const engineState = useEngineStateStore();
const engine = inject<Engine>(ENGINE_INJECT_KEY);
</script>

<style scoped>
.choice-fade-enter-active,
.choice-fade-leave-active {
  transition: opacity 0.25s ease;
}
.choice-fade-enter-from,
.choice-fade-leave-to {
  opacity: 0;
}
</style>
