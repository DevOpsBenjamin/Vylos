<template>
  <div
    v-if="engineState.availableActions.length > 0 && !engineState.dialogue && !engineState.choices"
    class="act-overlay"
  >
    <div class="act-overlay__row">
      <button
        v-for="action in engineState.availableActions"
        :key="action.id"
        :title="action.label"
        class="act-btn group"
        @click="engine?.navigationManager.selectAction(action.id)"
      >
        <div class="act-btn__bg"></div>
        <div class="act-btn__ring"></div>
        <div class="act-btn__label">
          <span class="act-btn__text">{{ action.label }}</span>
        </div>
        <div class="act-btn__gradient"></div>
      </button>
    </div>
  </div>
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
.act-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 1.5cqh 1.5cqw;
}

.act-overlay__row {
  display: flex;
  gap: 1cqw;
  pointer-events: auto;
  height: 18cqh;
  align-items: center;
}

.act-btn {
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: 9999px;
  height: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  transition: transform 0.2s ease-out;
  background: none;
}

.act-btn:hover {
  transform: scale(1.1) translateY(-0.8cqh);
}

.act-btn__bg {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  transition: all 0.2s;
}

.act-btn:hover .act-btn__bg {
  background: rgba(22, 163, 74, 0.6);
  border-color: rgba(255, 255, 255, 0.4);
}

.act-btn__ring {
  position: absolute;
  inset: 0.6cqw;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.2s;
}

.act-btn:hover .act-btn__ring {
  border-color: rgba(255, 255, 255, 0.3);
}

.act-btn__label {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.act-btn__text {
  color: white;
  font-weight: 500;
  font-size: 2.2cqw;
  text-align: center;
  line-height: 1.1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
}

.act-btn__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent);
  border-radius: 9999px;
  pointer-events: none;
}
</style>
