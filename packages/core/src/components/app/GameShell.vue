<template>
  <!-- Outer: full screen, centering -->
  <div class="game-shell">
    <!-- Blurred background that extends the game image to the edges -->
    <div class="game-shell__bg" :style="shellBgStyle"></div>

    <!-- Inner: ratio-locked viewport, container-query root -->
    <div class="game-viewport" :style="viewportStyle" @click="handleViewportClick">
      <!-- Loading -->
      <LoadingScreen v-if="isLoading" />

      <!-- Main menu -->
      <MainMenu v-else-if="isMainMenu" />

      <!-- Game view -->
      <EngineView v-else-if="isRunning" />

      <!-- Save/Load menu (modal, shown over game or main menu) -->
      <SaveLoadMenu v-if="engineState.menuOpen === MenuType.Save || engineState.menuOpen === MenuType.Load" />

      <!-- Settings menu (modal) -->
      <SettingsMenu v-if="engineState.menuOpen === MenuType.Settings" />

      <!-- Pause menu (modal, shown on Escape during gameplay) -->
      <PauseMenu v-if="engineState.menuOpen === MenuType.PauseMenu" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { EnginePhase, MenuType } from '../../engine/types';
import type { Engine } from '../../engine/core/Engine';
import type { HistoryStep } from '../../engine/core/EventRunner';
import { ENGINE_INJECT_KEY } from '../../composables/useEngine';
import { CONFIG_INJECT_KEY } from '../../composables/useConfig';
import { InputManager } from '../../engine/managers/InputManager';
import { assetUrl } from '../../utils/assetUrl';

import LoadingScreen from './LoadingScreen.vue';
import MainMenu from './MainMenu.vue';
import EngineView from './EngineView.vue';
import SaveLoadMenu from '../menu/SaveLoadMenu.vue';
import SettingsMenu from '../menu/SettingsMenu.vue';
import PauseMenu from '../menu/PauseMenu.vue';

const props = withDefaults(defineProps<{
  gameTitle?: string;
  projectId?: string;
}>(), {
  projectId: 'default',
});

// Engine is provided by main.ts via app.provide()
const engine = inject<Engine>(ENGINE_INJECT_KEY);
const config = inject(CONFIG_INJECT_KEY);
const engineState = useEngineStateStore();
const inputManager = new InputManager();

// --- Shell blurred background ---

const MENU_BG = '/assets/global/menu/main.png';

const shellBgStyle = computed(() => {
  const bg = engineState.background || MENU_BG;
  return {
    backgroundImage: `url('${assetUrl(bg)}')`,
  };
});

// --- Viewport style ---

const viewportStyle = computed(() => {
  if (!config) return { width: '100vw', height: '100vh' };
  const ratio = config.resolution.width / config.resolution.height;
  return {
    width: `min(100vw, calc(100vh * ${ratio}))`,
    height: `min(100vh, calc(100vw / ${ratio}))`,
  };
});

// --- Computed ---

const isLoading = computed(() => engineState.phase === EnginePhase.Loading);
const isMainMenu = computed(() => engineState.phase === EnginePhase.MainMenu);
const isRunning = computed(() =>
  engineState.phase === EnginePhase.Running ||
  engineState.phase === EnginePhase.Paused
);

// --- History step helpers ---

function applyHistoryStep(step: HistoryStep): void {
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

function restoreLiveDisplay(): void {
  const live = engine!.eventRunner.getLiveDialogue();
  if (live) {
    engineState.setDialogue({
      text: live.text,
      speaker: live.speaker,
      isNarration: !live.speaker,
    });
  }
  engineState.setChoices(null);
}

// --- Keyboard continue (Space/Enter) ---

function handleKeyboardContinue(): void {
  if (!engine) return;

  // If browsing history, forward exits history first
  if (engine.eventRunner.isBrowsingHistory) {
    const step = engine.eventRunner.historyForward();
    if (step) {
      applyHistoryStep(step);
    } else if (!engine.eventRunner.isBrowsingHistory) {
      engineState.historyBrowsing = false;
      restoreLiveDisplay();
    }
    return;
  }

  if (engineState.dialogue) {
    // Inside a say() call — resolve the wait to advance dialogue
    engine.eventRunner.resolveWait();
  } else if (!engineState.choices) {
    // Between events — tell the engine to continue the loop
    engine.navigationManager.continue();
  }
  // If choices are showing, ignore continue (player must click a choice)
}

function handleBack(): void {
  if (!engine) return;

  if (engineState.dialogue || engine.eventRunner.isBrowsingHistory) {
    // During dialogue or already browsing — browse text history
    const step = engine.eventRunner.historyBack();
    if (step) {
      engineState.historyBrowsing = true;
      applyHistoryStep(step);
    }
  } else {
    engine.navigationManager.goBack();
  }
}

function handleForward(): void {
  if (!engine) return;

  if (engine.eventRunner.isBrowsingHistory) {
    // In history mode — advance through history
    const step = engine.eventRunner.historyForward();
    if (step) {
      applyHistoryStep(step);
    } else if (!engine.eventRunner.isBrowsingHistory) {
      engineState.historyBrowsing = false;
      restoreLiveDisplay();
    }
  } else if (engineState.dialogue) {
    // At live dialogue — same as continue
    engine.eventRunner.resolveWait();
  } else {
    engine.navigationManager.goForward();
  }
}

// --- Mouse click navigation (left half = back, right half = forward) ---

function handleViewportClick(e: MouseEvent): void {
  if (!engine) return;
  // Only during Running phase, no menu open, no choices showing
  if (!isRunning.value || engineState.menuOpen || engineState.choices) return;

  const target = e.target as HTMLElement;
  // Don't intercept clicks on interactive elements (buttons, overlays, etc.)
  if (target.closest('button, a, [role="button"]')) return;

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const midpoint = rect.left + rect.width / 2;

  if (e.clientX >= midpoint) {
    handleKeyboardContinue();
  } else {
    handleBack();
  }
}

// --- Keyboard input ---

onMounted(() => {
  inputManager.start((action) => {
    // Don't process keyboard when a menu is open
    if (engineState.menuOpen) {
      if (action === 'menu') engineState.closeMenu();
      return;
    }

    switch (action) {
      case 'continue':
        handleKeyboardContinue();
        break;
      case 'menu':
        engineState.openMenu(MenuType.PauseMenu);
        break;
      case 'back':
        handleBack();
        break;
      case 'forward':
        handleForward();
        break;
      case 'skip-toggle':
        inputManager.toggleSkip();
        engineState.skipMode = !engineState.skipMode;
        break;
    }
  });
});

onUnmounted(() => {
  inputManager.stop();
});
</script>

<style scoped>
.game-shell {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
}

.game-shell__bg {
  position: absolute;
  inset: -20px;
  background-size: cover;
  background-position: center;
  filter: blur(30px) brightness(0.5);
  pointer-events: none;
}

.game-viewport {
  position: relative;
  overflow: hidden;
  container-type: size;
}
</style>
