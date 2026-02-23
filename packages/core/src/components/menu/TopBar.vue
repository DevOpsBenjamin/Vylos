<template>
  <div class="topbar">
    <div class="topbar__inner">
      <span v-if="locationName" class="topbar__item">&#128205; {{ locationName }}</span>
      <span class="topbar__separator"></span>
      <span class="topbar__item">&#9200; {{ gameTimeFormatted }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { useGameStateStore } from '../../stores/gameState';

const engineState = useEngineStateStore();
const gameState = useGameStateStore();

const locationName = computed(() => engineState.currentLocationId ?? '');

const gameTimeFormatted = computed(() => {
  const t = gameState.state.gameTime % 24;
  const h = Math.floor(t);
  const m = Math.round((t - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});
</script>

<style scoped>
.topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 25;
  display: flex;
  justify-content: center;
  padding: 1.2cqh 2cqw;
  pointer-events: none;
}

.topbar__inner {
  display: flex;
  align-items: center;
  gap: 1.5cqw;
  padding: 0.8cqh 2cqw;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.8cqw;
  pointer-events: auto;
}

.topbar__item {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.6cqw;
  white-space: nowrap;
}

.topbar__separator {
  width: 1px;
  height: 2cqh;
  background: rgba(255, 255, 255, 0.2);
}
</style>
