<script setup lang="ts">
/**
 * SettingsApp — Phone settings (placeholder).
 * Some settings are cosmetic, others will affect gameplay.
 */

const emit = defineEmits<{ back: [] }>();

const settingsGroups = [
  {
    title: 'General',
    items: [
      { icon: '\uD83D\uDD14', label: 'Notifications', value: 'On' },
      { icon: '\uD83C\uDF19', label: 'Dark Mode', value: 'Always' },
      { icon: '\uD83D\uDD0A', label: 'Sound', value: 'On' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: '\uD83D\uDC64', label: 'Profile', value: '' },
      { icon: '\uD83D\uDD12', label: 'Privacy', value: '' },
    ],
  },
  {
    title: 'About',
    items: [
      { icon: '\u2139\uFE0F', label: 'Version', value: '1.0.0' },
      { icon: '\uD83D\uDCBE', label: 'Storage', value: '2.1 GB' },
    ],
  },
];
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-white">
    <div class="h-12 flex items-center px-4 border-b border-gray-800 shrink-0">
      <span class="font-medium text-sm">Settings</span>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-for="group in settingsGroups" :key="group.title" class="mb-4">
        <div class="text-xs text-gray-500 uppercase px-4 py-2">{{ group.title }}</div>
        <div
          v-for="item in group.items"
          :key="item.label"
          class="flex items-center justify-between px-4 py-3 border-b border-gray-800/50"
        >
          <div class="flex items-center gap-3">
            <span>{{ item.icon }}</span>
            <span class="text-sm">{{ item.label }}</span>
          </div>
          <span class="text-xs text-gray-500">{{ item.value }} &#8250;</span>
        </div>
      </div>
    </div>
  </div>
</template>
