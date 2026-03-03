<template>
  <Teleport to="body">
    <div v-if="journalOpen" class="journal" @click.self="toggleJournal">
      <div class="journal__panel">
        <div class="journal__header">
          <span>&#128221; Journal</span>
          <button class="journal__close" @click="toggleJournal">&#10005;</button>
        </div>
        <div class="journal__body">
          <div v-if="entries.length === 0" class="journal__empty">No entries yet.</div>
          <div v-for="entry in entries" :key="entry.id" class="journal__entry">
            <div class="journal__entry-title">{{ entry.title }}</div>
            <div class="journal__entry-day">Day {{ entry.day }}</div>
            <div class="journal__entry-text">{{ entry.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStateStore } from '@vylos/core';
import { journalOpen, toggleJournal } from '@game/helpers/uiState';
import type { AdvancedGameState } from '@game/gameDatas/gameState';

const gameState = useGameStateStore();
const entries = computed(() => (gameState.state as unknown as AdvancedGameState).journal.entries);
</script>

<style scoped>
.journal {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.journal__panel {
  width: 90%;
  max-width: 600px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: rgba(15, 10, 25, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  overflow: hidden;
}

.journal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  font-size: 18px;
  font-weight: 600;
}

.journal__close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
}

.journal__close:hover {
  color: white;
}

.journal__body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.journal__empty {
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  padding: 32px 0;
}

.journal__entry {
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.journal__entry:last-child {
  border-bottom: none;
}

.journal__entry-title {
  color: #a78bfa;
  font-weight: 600;
  font-size: 15px;
}

.journal__entry-day {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  margin-top: 2px;
}

.journal__entry-text {
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  margin-top: 6px;
  line-height: 1.5;
}
</style>
