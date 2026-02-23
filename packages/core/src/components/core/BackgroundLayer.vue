<template>
  <Transition name="bg-fade">
    <div
      v-if="engineState.background"
      :key="engineState.background"
      class="absolute inset-0 bg-cover bg-center z-0"
      :style="{ backgroundImage: `url('${engineState.background}')` }"
    />
  </Transition>
</template>

<script setup lang="ts">
import { useEngineStateStore } from '../../stores/engineState';

const engineState = useEngineStateStore();
</script>

<style scoped>
.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity 0.6s ease;
}
.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}
</style>
