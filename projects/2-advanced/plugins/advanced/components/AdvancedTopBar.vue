<template>
  <div class="topbar">
    <div class="topbar__inner">
      <span v-if="locationName" class="topbar__item">&#128205; {{ locationName }}</span>
      <span class="topbar__separator"></span>
      <span class="topbar__item">&#9200; {{ timeLabel }}</span>
      <span class="topbar__separator"></span>
      <span class="topbar__item" :class="{ 'topbar__item--low': energy < 30 }">&#9889; {{ energy }}</span>
      <span class="topbar__separator"></span>
      <span class="topbar__item">&#10024; {{ charm }}</span>
      <span class="topbar__separator"></span>
      <span class="topbar__item">&#128214; Day {{ day }}</span>
      <span class="topbar__separator"></span>
      <button class="topbar__btn" @click="toggleJournal">&#128221;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEngineStateStore, useGameStateStore } from '@vylos/core';
import { formatTime, getTimePeriod } from '@game/helpers/time';
import { toggleJournal } from '@game/helpers/uiState';
import type { AdvancedGameState } from '@game/gameDatas/gameState';

const engineState = useEngineStateStore();
const gameState = useGameStateStore();

const state = computed(() => gameState.state as unknown as AdvancedGameState);
const locationName = computed(() => engineState.currentLocationId ?? '');
const energy = computed(() => state.value.energy);
const charm = computed(() => state.value.charm);
const day = computed(() => state.value.day);
const timeLabel = computed(() => {
  const t = state.value.gameTime;
  return `${formatTime(t)} (${getTimePeriod(t)})`;
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
  font-size: 1.4cqw;
  white-space: nowrap;
}

.topbar__item--low {
  color: #ef4444;
}

.topbar__separator {
  width: 1px;
  height: 2cqh;
  background: rgba(255, 255, 255, 0.2);
}

.topbar__btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.4cqw;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.topbar__btn:hover {
  color: #a78bfa;
}
</style>
