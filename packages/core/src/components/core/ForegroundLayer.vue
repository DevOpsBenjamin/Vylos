<template>
  <Transition name="fg-fade">
    <div
      v-if="engineState.foreground"
      class="absolute inset-0 flex items-end justify-center z-10 pointer-events-none"
    >
      <img
        :src="fgUrl"
        class="max-h-full object-contain"
        alt=""
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { assetUrl } from '../../utils/assetUrl';

const engineState = useEngineStateStore();

const fgUrl = computed(() => engineState.foreground ? assetUrl(engineState.foreground) : '');
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
