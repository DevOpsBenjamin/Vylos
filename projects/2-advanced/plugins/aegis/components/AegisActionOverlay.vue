<template>
  <div v-if="!engineState.dialogue && !engineState.choices && availableActions.length > 0"
    class="absolute left-0 bottom-0 w-[22cqw] max-h-[60cqh] bg-black/80 backdrop-blur-xl border-r border-t border-cyan-500/15 flex flex-col pointer-events-auto z-20 rounded-tr-[0.6cqw]">

    <!-- Header -->
    <div class="px-[1.5cqw] py-[0.8cqh] border-b border-cyan-500/15 shrink-0">
      <span class="text-[1.2cqw] font-mono font-bold text-green-400/80 uppercase tracking-widest">Actions</span>
    </div>

    <!-- Action List -->
    <div class="flex-1 overflow-y-auto p-[1cqw] flex flex-col gap-[0.6cqh] custom-scrollbar">
      <button
        v-for="action in availableActions"
        :key="action.id"
        class="w-full text-left px-[1.2cqw] py-[0.8cqh] border border-white/10 rounded-[0.4cqw] bg-white/5 text-white text-[1.1cqw] font-mono transition-all duration-150 hover:border-green-400/40 hover:bg-green-500/10 hover:shadow-[0_0_12px_rgba(34,197,94,0.15)] active:scale-[0.97]"
        @click="engine?.navigationManager.selectAction(action.id)"
      >
        {{ resolveText(action.label) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useEngineStateStore, ENGINE_INJECT_KEY, useLanguage } from '@vylos/core';
import type { Engine } from '@vylos/core';

const engineState = useEngineStateStore();
const engine = inject<Engine>(ENGINE_INJECT_KEY);
const { resolveText } = useLanguage();

const availableActions = computed(() => engineState.availableActions);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 197, 94, 0.3); border-radius: 10px; }
</style>
