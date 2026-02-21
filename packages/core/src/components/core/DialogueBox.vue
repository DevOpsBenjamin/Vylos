<template>
  <Transition name="dlg-slide">
    <div
      v-if="engineState.dialogue"
      class="dlg-wrapper"
      @click="handleClick"
    >
      <div class="dlg-box" :class="{ 'dlg-box--history': engineState.historyBrowsing }">
        <!-- Speaker name -->
        <div v-if="engineState.dialogue.speaker" class="dlg-speaker">
          {{ engineState.dialogue.speaker }}
        </div>

        <!-- Dialogue text -->
        <p class="dlg-text" :class="{ 'dlg-text--narration': engineState.dialogue.isNarration }">
          {{ engineState.dialogue.text }}
        </p>

        <!-- Continue / History indicator -->
        <div class="dlg-continue">
          <template v-if="engineState.historyBrowsing">
            &#9664; &#9654; history
          </template>
          <template v-else>
            &#9660; continue
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { ENGINE_INJECT_KEY } from '../../composables/useEngine';
import type { Engine } from '../../engine/core/Engine';

const engineState = useEngineStateStore();
const engine = inject<Engine>(ENGINE_INJECT_KEY);

function handleClick(): void {
  if (!engine) return;

  if (engine.eventRunner.isBrowsingHistory) {
    // In history mode — advance through history (click = forward)
    const step = engine.eventRunner.historyForward();
    if (step) {
      if (step.type === 'say' && step.dialogue) {
        engineState.setDialogue(step.dialogue);
        engineState.setChoices(null);
      } else if (step.type === 'choice' && step.choiceOptions) {
        engineState.setDialogue(null);
        engineState.setChoices({
          prompt: null,
          options: step.choiceOptions,
          historyStepIndex: step.stepIndex,
          historySelectedValue: step.choiceResult,
        });
      }
    }
    if (!engine.eventRunner.isBrowsingHistory) {
      engineState.historyBrowsing = false;
      const live = engine.eventRunner.getLiveDialogue();
      if (live) {
        engineState.setDialogue({
          text: live.text,
          speaker: live.speaker,
          isNarration: !live.speaker,
        });
      }
      engineState.setChoices(null);
    }
  } else {
    // Normal mode — resolve the wait to advance dialogue
    engine.eventRunner.resolveWait();
  }
}
</script>

<style scoped>
.dlg-slide-enter-active,
.dlg-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.dlg-slide-enter-from,
.dlg-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.dlg-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  padding: 2cqh 2cqw;
  cursor: pointer;
  user-select: none;
}

.dlg-box {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1cqw;
  padding: 2cqh 2.5cqw;
  max-width: 85cqw;
  margin: 0 auto;
  transition: border-color 0.2s ease;
}

.dlg-box--history {
  border-color: rgba(147, 197, 253, 0.4);
}

.dlg-speaker {
  color: #fde047;
  font-weight: 700;
  font-size: 1.8cqw;
  margin-bottom: 1cqh;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dlg-text {
  color: white;
  font-size: 2cqw;
  line-height: 1.6;
  margin: 0;
}

.dlg-text--narration {
  font-style: italic;
  color: rgba(255, 255, 255, 0.8);
}

.dlg-continue {
  text-align: right;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1.2cqw;
  margin-top: 1cqh;
}
</style>
