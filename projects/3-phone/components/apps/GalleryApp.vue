<script setup lang="ts">
/**
 * GalleryApp — Photo gallery placeholder.
 * Will eventually show photos unlocked through story progression.
 */

const emit = defineEmits<{ back: [] }>();

const placeholderPhotos = [
  { id: 1, icon: '\uD83C\uDF05', label: 'Sunset' },
  { id: 2, icon: '\uD83C\uDFD9\uFE0F', label: 'City View' },
  { id: 3, icon: '\uD83C\uDF3A', label: 'Flowers' },
];
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-white">
    <div class="h-12 flex items-center px-4 border-b border-gray-800 shrink-0">
      <span class="font-medium text-sm">Photos</span>
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      <div class="grid grid-cols-3 gap-1">
        <div
          v-for="photo in placeholderPhotos"
          :key="photo.id"
          class="aspect-square bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-1"
        >
          <span class="text-3xl">{{ photo.icon }}</span>
          <span class="text-[10px] text-gray-500">{{ photo.label }}</span>
        </div>

        <!-- Locked placeholders -->
        <div
          v-for="n in 6"
          :key="'locked-' + n"
          class="aspect-square bg-gray-850 rounded-lg flex items-center justify-center"
        >
          <span class="text-2xl opacity-20">&#128274;</span>
        </div>
      </div>
    </div>

    <div class="text-center text-gray-600 text-xs py-3">
      Unlock more photos as you progress
    </div>
  </div>
</template>
