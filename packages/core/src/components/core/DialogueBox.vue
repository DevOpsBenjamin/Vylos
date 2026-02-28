<template>
  <Transition name="dlg-slide">
    <div
      v-if="engineState.dialogue && !engineState.overlayId"
      class="absolute bottom-0 left-0 right-0 z-30 p-[2cqh_2cqw] pointer-events-none select-none"
    >
      <div
        class="bg-black/80 border border-white/20 rounded-[1cqw] p-[2cqh_2.5cqw] max-w-[85cqw] mx-auto transition-colors duration-200"
        :class="{ 'border-blue-300/40': engineState.historyBrowsing }"
      >
        <!-- Speaker name -->
        <div
          v-if="engineState.dialogue.speaker"
          class="font-bold text-[1.8cqw] mb-[1cqh] uppercase tracking-wider text-yellow-300"
          :style="engineState.dialogue.speaker.color ? { color: engineState.dialogue.speaker.color } : undefined"
        >
          {{ speakerName }}
        </div>

        <!-- Dialogue text -->
        <p
          class="text-white text-[2cqw] leading-relaxed m-0"
          :class="{ 'italic text-white/80': engineState.dialogue.isNarration }"
        >
          {{ engineState.dialogue.text }}
        </p>

        <!-- Continue / History indicator -->
        <div class="text-right text-white/40 text-[1.2cqw] mt-[1cqh]">
          <template v-if="engineState.historyBrowsing">
            &#9664; &#9654; history
          </template>
          <template v-else>
            &#9660; continue
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEngineStateStore } from '../../stores/engineState';
import { useLanguage } from '../../composables/useLanguage';

const engineState = useEngineStateStore();
const { resolveText } = useLanguage();

const speakerName = computed(() => {
  const speaker = engineState.dialogue?.speaker;
  if (!speaker) return '';
  return resolveText(speaker.name);
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
