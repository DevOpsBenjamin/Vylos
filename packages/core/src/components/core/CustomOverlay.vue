<template>
  <div v-if="engineState.overlayId" class="absolute inset-0 z-40 pointer-events-none">
    <!-- Project-specific overlay components are rendered here by ID -->
    <!-- Actual dynamic component resolution is handled by the project layer -->
    <component
      :is="resolvedComponent"
      v-if="resolvedComponent"
      v-bind="engineState.overlayProps ?? {}"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { Component } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';

const engineState = useEngineStateStore();

/** Optional registry injected by the project shell */
const overlayRegistry = inject<Record<string, Component>>('vylos-overlay-registry', {});

const resolvedComponent = computed<Component | undefined>(() => {
  if (!engineState.overlayId) return undefined;
  return overlayRegistry[engineState.overlayId];
});
</script>
