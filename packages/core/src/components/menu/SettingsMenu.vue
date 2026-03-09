<template>
  <div class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" @click.self="engineState.closeMenu()">
    <div class="bg-gray-900 border border-white/20 rounded-lg w-full max-w-lg p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white font-bold text-lg">&#9881; Settings</h2>
        <button class="text-white/50 hover:text-white text-xl" @click="engineState.closeMenu()">&times;</button>
      </div>

      <div class="flex flex-col gap-5 text-sm text-white/80">
        <!-- Text Speed -->
        <label class="flex items-center justify-between gap-4">
          <span>Text Speed</span>
          <input type="range" min="1" max="10" v-model.number="local.textSpeed" class="flex-1 max-w-48" />
          <span class="w-4 text-right">{{ local.textSpeed }}</span>
        </label>

        <!-- Auto Speed -->
        <label class="flex items-center justify-between gap-4">
          <span>Auto Speed</span>
          <input type="range" min="1" max="10" v-model.number="local.autoSpeed" class="flex-1 max-w-48" />
          <span class="w-4 text-right">{{ local.autoSpeed }}</span>
        </label>

        <!-- Volume: Master -->
        <label class="flex items-center justify-between gap-4">
          <span>&#128266; Master</span>
          <input type="range" min="0" max="100" v-model.number="local.volume.master" class="flex-1 max-w-48" />
          <span class="w-8 text-right">{{ local.volume.master }}</span>
        </label>

        <!-- Volume: Music -->
        <label class="flex items-center justify-between gap-4">
          <span>&#127925; Music</span>
          <input type="range" min="0" max="100" v-model.number="local.volume.music" class="flex-1 max-w-48" />
          <span class="w-8 text-right">{{ local.volume.music }}</span>
        </label>

        <!-- Volume: SFX -->
        <label class="flex items-center justify-between gap-4">
          <span>&#128232; SFX</span>
          <input type="range" min="0" max="100" v-model.number="local.volume.sfx" class="flex-1 max-w-48" />
          <span class="w-8 text-right">{{ local.volume.sfx }}</span>
        </label>

        <!-- Language -->
        <label class="flex items-center justify-between gap-4">
          <span>&#127760; Language</span>
          <select v-model="local.language" class="bg-gray-800 border border-white/20 text-white rounded px-2 py-1">
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">{{ lang.label }}</option>
          </select>
        </label>

        <!-- Fullscreen -->
        <label class="flex items-center justify-between gap-4 cursor-pointer">
          <span>Fullscreen</span>
          <input type="checkbox" v-model="local.fullscreen" class="w-4 h-4" />
        </label>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 mt-8">
        <button class="px-4 py-2 text-white/60 hover:text-white transition-colors" @click="engineState.closeMenu()">
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors"
          @click="apply"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, inject, onMounted } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { ENGINE_INJECT_KEY } from '../../composables/useEngine';
import { CONFIG_INJECT_KEY } from '../../composables/useConfig';
import type { Engine } from '../../engine/core/Engine';
import type { EngineSettings } from '../../engine/types';

const engine = inject<Engine>(ENGINE_INJECT_KEY);
const config = inject(CONFIG_INJECT_KEY);
const engineState = useEngineStateStore();

// Local copy — only committed on Apply
const local = reactive<EngineSettings>({
  textSpeed: 50,
  autoSpeed: 3,
  volume: { master: 80, music: 70, sfx: 80, voice: 100 },
  language: 'en',
  fullscreen: false,
});

const languages = config?.languages ?? [{ code: 'en', label: 'English' }];

onMounted(() => {
  if (engine) {
    const current = engine.settingsManager.settings;
    Object.assign(local, structuredClone(current));
  }
});

async function apply(): Promise<void> {
  if (engine) {
    await engine.settingsManager.update({ ...local });
  }
  engineState.closeMenu();
}
</script>
