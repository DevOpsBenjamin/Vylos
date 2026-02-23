<template>
  <Transition name="choice-fade">
    <div v-if="engineState.choices" class="choice-overlay">
      <p v-if="engineState.choices.prompt" class="choice-prompt">
        {{ engineState.choices.prompt }}
      </p>

      <div class="choice-list">
        <button
          v-for="option in engineState.choices.options"
          :key="option.value"
          :disabled="option.disabled"
          :class="[
            'choice-btn',
            { 'choice-btn--selected': isRedoMode && option.value === engineState.choices!.historySelectedValue },
          ]"
          @click="handleChoice(option.value)"
        >
          {{ option.text }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { ENGINE_INJECT_KEY } from '../../composables/useEngine';
import type { Engine } from '../../engine/core/Engine';

const engineState = useEngineStateStore();
const engine = inject<Engine>(ENGINE_INJECT_KEY);

const isRedoMode = computed(() => engineState.choices?.historyStepIndex != null);

function handleChoice(value: string): void {
  if (!engine) return;

  if (isRedoMode.value) {
    const stepIndex = engineState.choices!.historyStepIndex!;
    engineState.historyBrowsing = false;
    engineState.setChoices(null);
    engine.eventRunner.requestRedoChoice(stepIndex, value);
  } else {
    engine.eventRunner.resolveWait(value);
  }
}
</script>

<style scoped>
.choice-fade-enter-active,
.choice-fade-leave-active {
  transition: opacity 0.25s ease;
}
.choice-fade-enter-from,
.choice-fade-leave-to {
  opacity: 0;
}

.choice-overlay {
  position: absolute;
  inset: 0;
  z-index: 35;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 0 4cqw;
}

.choice-prompt {
  color: white;
  font-size: 2cqw;
  font-weight: 600;
  margin-bottom: 3cqh;
  text-align: center;
}

.choice-list {
  display: flex;
  flex-direction: column;
  gap: 1.5cqh;
  width: 100%;
  max-width: 50cqw;
}

.choice-btn {
  padding: 1.5cqh 3cqw;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.8cqw;
  text-align: left;
  border-radius: 0.5cqw;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.choice-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.6);
}

.choice-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.choice-btn--selected {
  border-color: rgba(147, 197, 253, 0.6);
  background: rgba(147, 197, 253, 0.15);
}
</style>
