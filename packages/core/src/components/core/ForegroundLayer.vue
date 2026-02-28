<template>
  <Transition name="fg-fade">
    <div
      v-if="engineState.foreground"
      class="absolute inset-0 z-10 pointer-events-none"
    >
      <img
        :src="fgUrl"
        alt=""
        class="absolute inset-0 w-full h-full object-cover blur-2xl scale-110"
      />
      <img
        :src="fgUrl"
        alt=""
        class="absolute inset-0 w-full h-full object-contain"
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
