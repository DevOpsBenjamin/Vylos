<template>
  <div class="main-menu" :style="menuBgStyle">
    <div class="main-menu__inner">
      <!-- Title -->
      <div class="main-menu__title-block">
        <h1 class="main-menu__title">{{ config?.name ?? 'Vylos' }}</h1>
        <div class="main-menu__separator"></div>
      </div>

      <!-- Buttons -->
      <div class="main-menu__buttons">
        <button class="main-menu__btn main-menu__btn--primary" @click="newGame">
          <span>New Game</span>
          <span class="main-menu__btn-icon">&#x2728;</span>
        </button>

        <button v-if="canContinue" class="main-menu__btn main-menu__btn--secondary" @click="continueGame">
          <span>Continue</span>
          <span class="main-menu__btn-icon">&#x25B6;&#xFE0F;</span>
        </button>

        <button class="main-menu__btn main-menu__btn--tertiary" @click="loadGame">
          <span>Load</span>
          <span class="main-menu__btn-icon">&#x1F4C2;</span>
        </button>

        <button class="main-menu__btn main-menu__btn--tertiary" @click="openSettings">
          <span>Settings</span>
          <span class="main-menu__btn-icon">&#x2699;&#xFE0F;</span>
        </button>
      </div>

      <!-- Footer -->
      <p class="main-menu__footer">Press ESC during gameplay to pause</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { useGameStateStore } from '../../stores/gameState';
import { ENGINE_INJECT_KEY } from '../../composables/useEngine';
import { CONFIG_INJECT_KEY } from '../../composables/useConfig';
import { EnginePhase, MenuType } from '../../engine/types';
import { assetUrl } from '../../utils/assetUrl';
import type { Engine } from '../../engine/core/Engine';
import type { VylosConfig } from '../../engine/types/config';

const engine = inject<Engine>(ENGINE_INJECT_KEY);
const config = inject<VylosConfig>(CONFIG_INJECT_KEY);
const engineState = useEngineStateStore();
const gameState = useGameStateStore();

const canContinue = computed(() => !!gameState.state.locationId);

const menuBgStyle = computed(() => ({
  backgroundImage: `url('${assetUrl('/assets/global/menu/main.png')}')`,
}));

function newGame() {
  engine?.startNewGame();
  engineState.setPhase(EnginePhase.Running);
}

function continueGame() {
  engineState.setPhase(EnginePhase.Running);
}

function loadGame() {
  engineState.openMenu(MenuType.Load);
}

function openSettings() {
  engineState.openMenu(MenuType.Settings);
}
</script>

<style scoped>
.main-menu {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  container-type: size;
  overflow: hidden;
}

.main-menu::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

/* Subtle radial glow behind the content */
.main-menu::before {
  content: '';
  position: absolute;
  z-index: 1;
  top: 30%;
  left: 50%;
  translate: -50% -50%;
  width: 60cqw;
  height: 60cqw;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.main-menu__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30cqw;
  max-height: calc(100cqh - 8cqh);
  overflow-y: auto;
  padding: 4cqh 3cqw;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5cqw;
}

/* Title block */
.main-menu__title-block {
  text-align: center;
  margin-bottom: 5cqh;
}

.main-menu__title {
  font-size: 3.2cqw;
  font-weight: 700;
  color: white;
  letter-spacing: 0.15em;
  margin: 0;
  overflow-wrap: break-word;
  text-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
}

.main-menu__separator {
  width: 12cqw;
  height: 0.25cqh;
  margin: 1.5cqh auto;
  background: linear-gradient(90deg, transparent, #8b5cf6, #ec4899, #8b5cf6, transparent);
  border-radius: 9999px;
}

.main-menu__subtitle {
  font-size: 1.4cqw;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-family: monospace;
  margin: 0;
}

/* Buttons */
.main-menu__buttons {
  display: flex;
  flex-direction: column;
  gap: 1.5cqh;
  width: 100%;
}

.main-menu__btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.8cqh 2cqw;
  border-radius: 1cqw;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 1.8cqw;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.main-menu__btn::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.25s;
  border-radius: inherit;
}

.main-menu__btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.main-menu__btn:hover::before {
  opacity: 1;
}

.main-menu__btn:active {
  opacity: 0.8;
}

/* Icon */
.main-menu__btn-icon {
  font-size: 2.2cqw;
  opacity: 0.5;
  transition: opacity 0.25s;
}

.main-menu__btn:hover .main-menu__btn-icon {
  opacity: 1;
}

/* Variants */
.main-menu__btn--primary::before {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1));
}

.main-menu__btn--primary:hover {
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.2);
}

.main-menu__btn--secondary::before {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1));
}

.main-menu__btn--secondary:hover {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
}

.main-menu__btn--tertiary::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
}

.main-menu__btn--tertiary:hover {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.08);
}

/* Footer */
.main-menu__footer {
  margin-top: 4cqh;
  font-size: 1.1cqw;
  color: rgba(255, 255, 255, 0.25);
  font-family: monospace;
}
</style>
