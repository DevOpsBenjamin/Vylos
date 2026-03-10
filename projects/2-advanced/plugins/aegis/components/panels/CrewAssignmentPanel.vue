<template>
  <div class="absolute inset-[5cqw] bg-black/92 backdrop-blur-xl border border-cyan-500/25 rounded-[0.8cqw] pointer-events-auto overflow-hidden flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.15)] z-50">

    <!-- Header -->
    <div class="flex items-center justify-between px-[2cqw] py-[1.2cqh] border-b border-cyan-500/20 shrink-0">
      <span class="text-[1.5cqw] font-mono font-bold text-cyan-300 uppercase tracking-widest">Crew Assignment</span>
      <div class="flex items-center gap-[1.5cqw]">
        <span v-if="selectedCrew" class="text-[1.1cqw] font-mono text-amber-300">
          Moving: {{ selectedCrew.name }} — click a module
        </span>
        <button class="text-white/40 hover:text-white text-[2cqw] leading-none font-mono" @click="close">x</button>
      </div>
    </div>

    <!-- Station Map -->
    <div class="flex-1 p-[2cqw] flex items-center justify-center">
      <div class="grid grid-cols-3 grid-rows-2 gap-[1.5cqw] w-full max-w-[70cqw]" style="grid-template-areas: 'reactor bridge airlock' 'medbay . quarters';">

        <ModuleSlot
          v-for="mod in modules"
          :key="mod.id"
          :module="mod"
          :crew-here="crewAt(mod.id)"
          :selected-crew-id="ui.selectedCrewId"
          :style="{ gridArea: mod.id }"
          @select-crew="selectCrew"
          @assign-here="assignHere(mod.id)"
        />

        <!-- Center empty cell -->
        <div class="flex items-center justify-center" style="grid-area: 2 / 2;">
          <div class="text-[3cqw] text-cyan-500/20 font-mono font-bold">AEGIS</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@game/gameState';
import type { ModuleId } from '@game/gameState/stations';
import type { CrewMember } from '@game/gameState/crews';
import ModuleSlot from './ModuleSlot.vue';

const emit = defineEmits<{ close: [] }>();

const gameStore = useGameStore();
const state = computed(() => gameStore.state);
const ui = computed(() => gameStore.state.ui);

const selectedCrew = computed(() => {
  const id = ui.value.selectedCrewId;
  if (!id) return null;
  return crewList.value.find(c => c.id === id) ?? null;
});

const crewList = computed(() => [state.value.crews.jax, state.value.crews.elena, state.value.crews.kael]);

const modules = computed(() => {
  const ids: ModuleId[] = ['bridge', 'reactor', 'medbay', 'airlock', 'quarters'];
  return ids.map(id => ({ id, ...state.value.station.modules[id] }));
});

function crewAt(moduleId: ModuleId): CrewMember[] {
  return crewList.value.filter(c => c.location === moduleId);
}

function selectCrew(crewId: string) {
  if (gameStore.state.ui.selectedCrewId === crewId) {
    gameStore.state.ui.selectedCrewId = null;
  } else {
    gameStore.state.ui.selectedCrewId = crewId;
  }
}

function assignHere(moduleId: ModuleId) {
  const id = gameStore.state.ui.selectedCrewId;
  if (!id) return;
  const crew = crewList.value.find(c => c.id === id);
  if (crew) {
    crew.location = moduleId;
    gameStore.state.ui.selectedCrewId = null;
  }
}

function close() {
  gameStore.state.ui.selectedCrewId = null;
  emit('close');
}
</script>
