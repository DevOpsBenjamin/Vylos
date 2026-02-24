<script setup lang="ts">
/**
 * PhoneDialogue — Chat-bubble style dialogue instead of VN bottom panel.
 * Messages appear as iMessage-style bubbles.
 */
import { useEngineStateStore } from '@vylos/core';

const engineState = useEngineStateStore();

const emit = defineEmits<{ continue: [] }>();
</script>

<template>
  <div
    class="absolute inset-0 flex flex-col justify-end p-4 pb-6 cursor-pointer"
    @click="emit('continue')"
  >
    <!-- Chat area -->
    <div class="flex flex-col gap-2">
      <!-- Speaker label if present -->
      <div v-if="engineState.dialogue?.speaker" class="text-xs text-gray-400 px-2">
        {{ engineState.dialogue.speaker }}
      </div>

      <!-- Message bubble -->
      <div
        :class="[
          'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          engineState.dialogue?.speaker
            ? 'bg-gray-700 text-white self-start rounded-bl-md'
            : 'bg-blue-600 text-white self-end rounded-br-md'
        ]"
      >
        {{ engineState.dialogue?.text }}
      </div>
    </div>

    <!-- Tap to continue hint -->
    <div class="text-center text-gray-600 text-[10px] mt-3 animate-pulse">
      tap to continue
    </div>
  </div>
</template>
