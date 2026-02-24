<template>
  <Transition name="bg-fade">
    <div
      v-if="engineState.background"
      :key="engineState.background"
      class="absolute inset-0 bg-cover bg-center z-0"
      :style="{ backgroundImage: `url('${bgUrl}')` }"
    />
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { assetUrl } from '../../utils/assetUrl';

const engineState = useEngineStateStore();

const bgUrl = computed(() => engineState.background ? assetUrl(engineState.background) : '');
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
