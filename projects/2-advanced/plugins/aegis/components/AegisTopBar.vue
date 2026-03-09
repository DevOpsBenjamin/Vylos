<template>
  <!-- HUD Wrapper: pointer-events none to pass clicks to background -->
  <div class="absolute inset-0 pointer-events-none z-50 overflow-hidden">

    <!-- Top HUD Bar -->
    <div class="absolute top-0 left-0 right-0 flex items-center justify-between px-[2cqw] py-[1cqh] pointer-events-auto bg-black/70 backdrop-blur-md border-b border-cyan-500/20">

      <!-- Left: Day / Phase -->
      <div class="flex items-center gap-[1.5cqw]">
        <div class="flex flex-col leading-tight">
          <span class="text-[0.9cqw] text-cyan-400/60 uppercase tracking-widest font-bold">Day</span>
          <span class="text-[1.8cqw] text-cyan-300 font-mono font-bold">{{ state.time.day }} / 10</span>
        </div>
        <div class="w-px h-[3cqh] bg-cyan-500/20"></div>
        <div class="flex flex-col leading-tight">
          <span class="text-[0.9cqw] text-cyan-400/60 uppercase tracking-widest font-bold">Phase</span>
          <span class="text-[1.4cqw] text-cyan-200 font-mono uppercase">{{ state.time.phase }}</span>
        </div>
      </div>

      <!-- Center: Resource Gauges -->
      <div class="flex items-center gap-[2cqw]">
        <ResourceGauge label="O2" :value="state.station.oxygen" :max="100" color="cyan" :critical="state.station.oxygen <= 20" />
        <ResourceGauge label="NRG" :value="state.station.energy" :max="100" color="amber" :critical="state.station.energy <= 20" />
        <ResourceGauge label="MAT" :value="state.station.materials" :max="50" color="emerald" :critical="state.station.materials <= 5" />
      </div>

      <!-- Right: Panel Buttons -->
      <div class="flex items-center gap-[0.8cqw]">
        <button
          class="hud-btn"
          :class="{ 'hud-btn--active': state.ui.crewRosterOpen }"
          @click="togglePanel('crewRosterOpen')"
        >
          <span class="text-[1.2cqw]">CREW</span>
        </button>
        <button
          class="hud-btn"
          :class="{ 'hud-btn--active': state.ui.stationOverviewOpen }"
          @click="togglePanel('stationOverviewOpen')"
        >
          <span class="text-[1.2cqw]">STATION</span>
        </button>
      </div>
    </div>

    <!-- Crew Status Indicators (below HUD bar) -->
    <div class="absolute top-[8.5cqh] left-[2cqw] flex items-center gap-[1cqw] pointer-events-none">
      <CrewIndicator v-for="member in crewList" :key="member.id" :crew="member" />
    </div>

    <!-- Panels (conditionally rendered) -->
    <CrewRosterPanel v-if="state.ui.crewRosterOpen" @close="state.ui.crewRosterOpen = false" />
    <StationOverviewPanel v-if="state.ui.stationOverviewOpen" @close="state.ui.stationOverviewOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@game/gameState';
import type { AegisUIState } from '@game/gameState/ui';
import ResourceGauge from './hud/ResourceGauge.vue';
import CrewIndicator from './hud/CrewIndicator.vue';
import CrewRosterPanel from './panels/CrewRosterPanel.vue';
import StationOverviewPanel from './panels/StationOverviewPanel.vue';

const gameStore = useGameStore();
const state = computed(() => gameStore.state);

const crewList = computed(() => [state.value.crews.jax, state.value.crews.elena, state.value.crews.kael]);

function togglePanel(key: keyof AegisUIState) {
  gameStore.state.ui[key] = !gameStore.state.ui[key];
}
</script>

<style scoped>
.hud-btn {
  padding: 0.5cqh 1cqw;
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.4cqw;
  background: rgba(0, 0, 0, 0.4);
  color: rgba(6, 182, 212, 0.8);
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.15s;
  pointer-events: auto;
}
.hud-btn:hover {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.6);
  color: rgba(6, 182, 212, 1);
}
.hud-btn--active {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(6, 182, 212, 0.7);
  color: white;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.3);
}
</style>
