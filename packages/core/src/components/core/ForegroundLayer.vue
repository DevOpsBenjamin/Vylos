<template>
  <Transition name="fg-fade">
    <div
      v-if="engineState.foreground"
      class="absolute inset-0 flex items-end justify-center z-10 pointer-events-none"
    >
      <img
        :src="engineState.foreground"
        class="max-h-full object-contain"
        alt=""
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useEngineStateStore } from '../../stores/engineState';

const engineState = useEngineStateStore();
</script>

<style scoped>
.fg-fade-enter-active,
.fg-fade-leave-active {
  transition: opacity 0.3s ease;
}
.fg-fade-enter-from,
.fg-fade-leave-to {
  opacity: 0;
}
</style>
