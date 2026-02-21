<script setup lang="ts">
/**
 * MessagesApp — Chat list and conversation view (placeholder).
 * In the future, this will show real conversations driven by events.
 */
import { ref, computed } from 'vue';
import { useGameStateStore } from '@vylos/core';

const gameState = useGameStateStore();
const selectedContact = ref<string | null>(null);

const phone = computed(() => (gameState.state as Record<string, unknown>).phone as {
  contacts?: Array<{ id: string; name: string; avatar: string; unread: number }>;
  conversations?: Record<string, Array<{ from: string; text: string; timestamp: number }>>;
} | undefined);

const contacts = computed(() => phone.value?.contacts ?? [
  { id: 'unknown', name: 'Unknown Number', avatar: '', unread: 1 },
]);

const currentMessages = computed(() => {
  if (!selectedContact.value) return [];
  return phone.value?.conversations?.[selectedContact.value] ?? [];
});

const emit = defineEmits<{ back: [] }>();
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-white">
    <!-- Header -->
    <div class="h-12 flex items-center px-4 border-b border-gray-800 shrink-0">
      <button
        v-if="selectedContact"
        class="text-blue-400 text-sm mr-3"
        @click="selectedContact = null"
      >
        &#8592; Back
      </button>
      <span class="font-medium text-sm">{{ selectedContact ? contacts.find(c => c.id === selectedContact)?.name : 'Messages' }}</span>
    </div>

    <!-- Contact list -->
    <div v-if="!selectedContact" class="flex-1 overflow-y-auto">
      <button
        v-for="contact in contacts"
        :key="contact.id"
        class="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/50 text-left"
        @click="selectedContact = contact.id"
      >
        <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg shrink-0">
          {{ contact.avatar || '\uD83D\uDC64' }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium">{{ contact.name }}</div>
          <div class="text-xs text-gray-500 truncate">Tap to view conversation</div>
        </div>
        <div v-if="contact.unread > 0" class="w-5 h-5 bg-blue-500 rounded-full text-[10px] flex items-center justify-center">
          {{ contact.unread }}
        </div>
      </button>

      <div v-if="contacts.length === 0" class="flex-1 flex items-center justify-center text-gray-600 text-sm p-8">
        No messages yet
      </div>
    </div>

    <!-- Conversation view (placeholder) -->
    <div v-else class="flex-1 flex flex-col">
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="currentMessages.length === 0" class="text-center text-gray-600 text-sm mt-8">
          Start of conversation
        </div>
        <div
          v-for="(msg, i) in currentMessages"
          :key="i"
          :class="[
            'max-w-[80%] px-3 py-2 rounded-2xl text-sm mb-2',
            msg.from === 'player'
              ? 'bg-blue-600 text-white self-end ml-auto rounded-br-md'
              : 'bg-gray-700 text-white rounded-bl-md'
          ]"
        >
          {{ msg.text }}
        </div>
      </div>

      <!-- Input bar (placeholder, non-functional) -->
      <div class="h-12 flex items-center gap-2 px-3 border-t border-gray-800 shrink-0">
        <div class="flex-1 h-8 bg-gray-800 rounded-full px-3 flex items-center text-xs text-gray-500">
          Message...
        </div>
        <button class="text-blue-400 text-sm font-medium">Send</button>
      </div>
    </div>
  </div>
</template>
