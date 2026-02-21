<template>
  <div class="pause-menu" @click.self="resume">
    <div class="pause-menu__inner">
      <h2 class="pause-menu__title">Paused</h2>
      <div class="pause-menu__separator"></div>

      <div class="pause-menu__buttons">
        <button class="pause-menu__btn pause-menu__btn--primary" @click="resume">
          <span>Continue</span>
          <span class="pause-menu__btn-icon">&#x25B6;&#xFE0F;</span>
        </button>

        <button class="pause-menu__btn pause-menu__btn--tertiary" @click="save">
          <span>Save</span>
          <span class="pause-menu__btn-icon">&#x1F4BE;</span>
        </button>

        <button class="pause-menu__btn pause-menu__btn--tertiary" @click="load">
          <span>Load</span>
          <span class="pause-menu__btn-icon">&#x1F4C2;</span>
        </button>

        <button class="pause-menu__btn pause-menu__btn--tertiary" @click="settings">
          <span>Settings</span>
          <span class="pause-menu__btn-icon">&#x2699;&#xFE0F;</span>
        </button>

        <button class="pause-menu__btn pause-menu__btn--danger" @click="mainMenu">
          <span>Main Menu</span>
          <span class="pause-menu__btn-icon">&#x1F3E0;</span>
        </button>
      </div>

      <p class="pause-menu__footer">ESC to resume</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEngineStateStore } from '../../stores/engineState';
import { EnginePhase, MenuType } from '../../engine/types';

const engineState = useEngineStateStore();

function resume() {
  engineState.closeMenu();
}

function save() {
  engineState.openMenu(MenuType.Save);
}

function load() {
  engineState.openMenu(MenuType.Load);
}

function settings() {
  engineState.openMenu(MenuType.Settings);
}

function mainMenu() {
  engineState.closeMenu();
  engineState.setPhase(EnginePhase.MainMenu);
}
</script>

<style scoped>
.pause-menu {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  container-type: size;
}

.pause-menu__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 28cqw;
  padding: 3.5cqh 2.5cqw;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5cqw;
}

.pause-menu__title {
  font-size: 3cqw;
  font-weight: 700;
  color: white;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin: 0;
}

.pause-menu__separator {
  width: 10cqw;
  height: 0.25cqh;
  margin: 1.5cqh auto;
  background: linear-gradient(90deg, transparent, #8b5cf6, #ec4899, #8b5cf6, transparent);
  border-radius: 9999px;
}

.pause-menu__buttons {
  display: flex;
  flex-direction: column;
  gap: 1.2cqh;
  width: 100%;
}

.pause-menu__btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.5cqh 2cqw;
  border-radius: 1cqw;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 1.6cqw;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.pause-menu__btn::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.25s;
  border-radius: inherit;
}

.pause-menu__btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.pause-menu__btn:hover::before {
  opacity: 1;
}

.pause-menu__btn:active {
  opacity: 0.8;
}

.pause-menu__btn-icon {
  font-size: 2cqw;
  opacity: 0.5;
  transition: opacity 0.25s;
}

.pause-menu__btn:hover .pause-menu__btn-icon {
  opacity: 1;
}

.pause-menu__btn--primary::before {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1));
}

.pause-menu__btn--primary:hover {
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.2);
}

.pause-menu__btn--tertiary::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
}

.pause-menu__btn--tertiary:hover {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.08);
}

.pause-menu__btn--danger::before {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1));
}

.pause-menu__btn--danger:hover {
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
}

.pause-menu__footer {
  margin-top: 3cqh;
  font-size: 1.1cqw;
  color: rgba(255, 255, 255, 0.25);
  font-family: monospace;
}
</style>
