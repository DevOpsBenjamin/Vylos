<template>
  <div class="sl-overlay" @click.self="engineState.closeMenu()">
    <div class="sl-panel">
      <!-- Header -->
      <div class="sl-header">
        <div class="sl-tabs">
          <button
            class="sl-tab"
            :class="{ 'sl-tab--active': activeTab === 'save' }"
            @click="activeTab = 'save'"
          >
            &#x1F4BE; Save
          </button>
          <button
            class="sl-tab"
            :class="{ 'sl-tab--active': activeTab === 'load' }"
            @click="activeTab = 'load'"
          >
            &#x1F4C2; Load
          </button>
        </div>
        <button class="sl-close" @click="engineState.closeMenu()">&#x2715;</button>
      </div>

      <div class="sl-separator"></div>

      <!-- Slot grid -->
      <div class="sl-grid">
        <button
          v-for="slot in pageSlots"
          :key="slot"
          class="sl-slot"
          :class="{ 'sl-slot--empty': !slotMeta[slot], 'sl-slot--confirm': confirmSlot === slot }"
          @click="handleSlot(slot)"
        >
          <!-- Confirm overwrite prompt -->
          <template v-if="confirmSlot === slot">
            <div class="sl-slot__confirm-text">Overwrite?</div>
            <div class="sl-slot__confirm-actions">
              <button class="sl-slot__confirm-btn sl-slot__confirm-btn--yes" @click.stop="confirmSave(slot)">Yes</button>
              <button class="sl-slot__confirm-btn sl-slot__confirm-btn--no" @click.stop="confirmSlot = null">No</button>
            </div>
          </template>

          <template v-else>
            <!-- Indicator -->
            <div class="sl-slot__header">
              <span class="sl-slot__number">Slot {{ slot }}</span>
              <span v-if="slotMeta[slot]" class="sl-slot__dot"></span>
            </div>

            <!-- Content -->
            <div v-if="slotMeta[slot]" class="sl-slot__info">
              <span class="sl-slot__label">{{ slotMeta[slot]!.label }}</span>
              <span class="sl-slot__time">{{ formatTime(slotMeta[slot]!.timestamp) }}</span>
            </div>
            <div v-else class="sl-slot__empty-text">Empty</div>
          </template>
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="sl-pagination">
        <button class="sl-page-btn" :disabled="page === 0" @click="page--">
          &#x25C0;
        </button>
        <span class="sl-page-info">{{ page + 1 }} / {{ totalPages }}</span>
        <button class="sl-page-btn" :disabled="page >= totalPages - 1" @click="page++">
          &#x25B6;
        </button>
      </div>

      <!-- Footer -->
      <p class="sl-footer">ESC to close</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, watch } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { useGameStateStore } from '../../stores/gameState';
import { ENGINE_INJECT_KEY } from '../../composables/useEngine';
import { EnginePhase, MenuType } from '../../engine/types';
import type { Engine } from '../../engine/core/Engine';
import type { SaveMeta } from '../../engine/types';

const engine = inject<Engine>(ENGINE_INJECT_KEY);
const engineState = useEngineStateStore();
const gameState = useGameStateStore();

const TOTAL_SLOTS = 24;
const PER_PAGE = 8;

const activeTab = ref<'save' | 'load'>(
  engineState.menuOpen === MenuType.Load ? 'load' : 'save',
);
const page = ref(0);
const slotMeta = ref<Record<number, SaveMeta>>({});
const confirmSlot = ref<number | null>(null);

const totalPages = computed(() => Math.ceil(TOTAL_SLOTS / PER_PAGE));
const pageSlots = computed(() => {
  const start = page.value * PER_PAGE + 1;
  return Array.from({ length: PER_PAGE }, (_, i) => start + i);
});

// Sync tab when menu type changes externally
watch(() => engineState.menuOpen, (val) => {
  if (val === MenuType.Save) activeTab.value = 'save';
  else if (val === MenuType.Load) activeTab.value = 'load';
});

// Reset confirm when switching tab or page
watch([activeTab, page], () => { confirmSlot.value = null; });

async function refreshSlots(): Promise<void> {
  if (!engine) return;
  const list = await engine.saveManager.listSlots();
  const map: Record<number, SaveMeta> = {};
  for (const meta of list) {
    map[meta.slot] = meta;
  }
  slotMeta.value = map;
}

onMounted(refreshSlots);

async function handleSlot(slot: number): Promise<void> {
  if (!engine) return;
  if (activeTab.value === 'save') {
    if (slotMeta.value[slot]) {
      confirmSlot.value = slot;
      return;
    }
    await doSave(slot);
  } else {
    const data = await engine.saveManager.load(slot);
    if (data) {
      engine.loadSave(data, (s) => gameState.setState(s));
      if (data.gameState.locationId) {
        engineState.setLocation(data.gameState.locationId);
      }
      engineState.historyBrowsing = false;
      engineState.setDialogue(null);
      engineState.setChoices(null);
      engineState.setForeground(null);
      engineState.closeMenu();
      if (engineState.phase === EnginePhase.MainMenu) {
        engineState.setPhase(EnginePhase.Running);
      }
    }
  }
}

async function doSave(slot: number): Promise<void> {
  if (!engine) return;
  await engine.saveManager.save(slot, {
    gameState: gameState.state,
    eventId: engine.eventRunner.currentEventId,
    stepNumber: engine.eventRunner.checkpoints.count,
    label: `Save ${slot}`,
    thumbnail: null,
    checkpoints: engine.eventRunner.currentEventId
      ? engine.eventRunner.checkpoints.getAll()
      : undefined,
    initialState: engine.eventRunner.getInitialState() ?? undefined,
    history: engine.historyManager.getAll(),
    historyIndex: engine.historyManager.index,
    lockedEventIds: engine.eventManager.getLockedIds(),
  });
  confirmSlot.value = null;
  await refreshSlots();
}

async function confirmSave(slot: number): Promise<void> {
  await doSave(slot);
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
</script>

<style scoped>
.sl-overlay {
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

.sl-panel {
  display: flex;
  flex-direction: column;
  width: 62cqw;
  max-height: 88cqh;
  padding: 3cqh 3cqw;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5cqw;
  overflow-y: auto;
}

/* Header */
.sl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sl-tabs {
  display: flex;
  gap: 0.8cqw;
}

.sl-tab {
  padding: 1cqh 2cqw;
  border-radius: 0.8cqw;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5cqw;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sl-tab:hover {
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.25);
}

.sl-tab--active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.sl-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 2cqw;
  cursor: pointer;
  padding: 0.5cqh 0.8cqw;
  transition: color 0.2s;
}

.sl-close:hover {
  color: white;
}

/* Separator */
.sl-separator {
  width: 100%;
  height: 1px;
  margin: 1.5cqh 0;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4), rgba(139, 92, 246, 0.4), transparent);
}

/* Grid */
.sl-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.2cqh 1cqw;
}

.sl-slot {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.2cqh 1.2cqw;
  border-radius: 0.8cqw;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 8cqh;
}

.sl-slot:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
  transform: scale(1.02);
}

.sl-slot:active {
  opacity: 0.8;
}

.sl-slot--empty {
  opacity: 0.6;
}

.sl-slot--empty:hover {
  opacity: 1;
}

/* Slot content */
.sl-slot__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6cqh;
}

.sl-slot__number {
  font-size: 1cqw;
  color: rgba(255, 255, 255, 0.45);
  font-family: monospace;
}

.sl-slot__dot {
  width: 0.6cqw;
  height: 0.6cqw;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.6);
  animation: sl-pulse 2s ease-in-out infinite;
}

@keyframes sl-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.sl-slot__info {
  display: flex;
  flex-direction: column;
  gap: 0.3cqh;
}

.sl-slot__label {
  font-size: 1.2cqw;
  color: white;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sl-slot__time {
  font-size: 0.9cqw;
  color: rgba(255, 255, 255, 0.35);
  font-family: monospace;
}

.sl-slot__empty-text {
  font-size: 1.1cqw;
  color: rgba(255, 255, 255, 0.2);
  font-style: italic;
}

/* Confirm overwrite */
.sl-slot--confirm {
  border-color: rgba(234, 179, 8, 0.4);
  background: rgba(234, 179, 8, 0.08);
}

.sl-slot__confirm-text {
  font-size: 1.2cqw;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.8cqh;
}

.sl-slot__confirm-actions {
  display: flex;
  gap: 0.8cqw;
  justify-content: center;
}

.sl-slot__confirm-btn {
  padding: 0.5cqh 1.5cqw;
  border-radius: 0.5cqw;
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 1cqw;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.sl-slot__confirm-btn--yes {
  background: rgba(234, 179, 8, 0.2);
  color: #fbbf24;
}

.sl-slot__confirm-btn--yes:hover {
  background: rgba(234, 179, 8, 0.35);
  border-color: rgba(234, 179, 8, 0.5);
}

.sl-slot__confirm-btn--no {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
}

.sl-slot__confirm-btn--no:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Pagination */
.sl-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2cqw;
  margin-top: 2cqh;
}

.sl-page-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.6cqw;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2cqw;
  padding: 0.5cqh 1.2cqw;
  cursor: pointer;
  transition: all 0.2s;
}

.sl-page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.sl-page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.sl-page-info {
  font-size: 1.1cqw;
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
}

/* Footer */
.sl-footer {
  margin-top: 2cqh;
  text-align: center;
  font-size: 1cqw;
  color: rgba(255, 255, 255, 0.2);
  font-family: monospace;
}
</style>
