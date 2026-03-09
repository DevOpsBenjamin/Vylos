<template>
  <Transition name="dlg-slide">
    <div
      v-if="engineState.dialogue && !engineState.overlayId"
      class="absolute bottom-0 left-0 right-0 z-30 p-[2cqh_2cqw] pointer-events-none select-none"
    >
      <div
        class="bg-black/85 border rounded-[0.6cqw] p-[2cqh_2.5cqw] max-w-[85cqw] mx-auto transition-colors duration-200 backdrop-blur-md"
        :class="engineState.historyBrowsing ? 'border-blue-300/40' : 'border-cyan-500/20'"
      >
        <!-- Speaker name -->
        <div
          v-if="engineState.dialogue.speaker"
          class="font-mono font-bold text-[1.4cqw] mb-[0.8cqh] uppercase tracking-[0.2em]"
          :style="engineState.dialogue.speaker.color ? { color: engineState.dialogue.speaker.color } : { color: '#22d3ee' }"
        >
          {{ speakerName }}
        </div>

        <!-- Dialogue text -->
        <p
          class="text-white text-[1.8cqw] leading-relaxed m-0 font-light"
          :class="{ 'italic text-cyan-100/70': engineState.dialogue.isNarration }"
        >
          {{ dialogueText }}
        </p>

        <!-- Continue / History indicator -->
        <div class="text-right text-cyan-400/40 text-[1cqw] mt-[1cqh] font-mono">
          <template v-if="engineState.historyBrowsing">[ &lt; &gt; HISTORY ]</template>
          <template v-else>[ CONTINUE &gt; ]</template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEngineStateStore, useLanguage } from '@vylos/core';
import { interpolate } from '@vylos/core';

const engineState = useEngineStateStore();
const { resolveText } = useLanguage();

const speakerName = computed(() => {
  const speaker = engineState.dialogue?.speaker;
  if (!speaker) return '';
  return resolveText(speaker.name);
});

const dialogueText = computed(() => {
  const d = engineState.dialogue;
  if (!d) return '';
  const text = resolveText(d.text);
  return d.variables ? interpolate(text, d.variables) : text;
});
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
</style>
