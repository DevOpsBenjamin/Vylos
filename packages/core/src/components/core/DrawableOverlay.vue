<template>
  <div
    v-if="engineState.drawableEvents.length > 0 && !engineState.dialogue && !engineState.choices"
    class="draw-overlay"
  >
    <button
      v-for="entry in engineState.drawableEvents"
      :key="entry.id"
      :title="entry.label"
      :class="['draw-btn', `draw-btn--${entry.position}`]"
      @click.stop="engine?.navigationManager.selectDrawableEvent(entry.id)"
    >
      <div class="draw-btn__bg"></div>
      <div class="draw-btn__content">
        <span v-if="entry.icon" class="draw-btn__icon">{{ entry.icon }}</span>
        <span class="draw-btn__label">{{ entry.label }}</span>
      </div>
    </button>
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
.draw-overlay {
  position: absolute;
  inset: 0;
  z-index: 15;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3cqw;
  padding: 5cqh 3cqw;
}

.draw-btn {
  pointer-events: auto;
  position: relative;
  border: none;
  border-radius: 1.5cqw;
  padding: 2cqh 2.5cqw;
  cursor: pointer;
  transition: transform 0.2s ease-out;
  background: none;
}

.draw-btn--left {
  align-self: center;
  margin-right: auto;
}

.draw-btn--center {
  align-self: center;
}

.draw-btn--right {
  align-self: center;
  margin-left: auto;
}

.draw-btn:hover {
  transform: scale(1.08) translateY(-0.5cqh);
}

.draw-btn__bg {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5cqw;
  transition: all 0.2s;
}

.draw-btn:hover .draw-btn__bg {
  background: rgba(168, 85, 247, 0.5);
  border-color: rgba(255, 255, 255, 0.4);
}

.draw-btn__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5cqh;
}

.draw-btn__icon {
  font-size: 4cqw;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.draw-btn__label {
  color: white;
  font-weight: 500;
  font-size: 2cqw;
  text-align: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}
</style>
