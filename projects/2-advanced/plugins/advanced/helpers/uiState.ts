import { ref } from 'vue';

export const journalOpen = ref(false);

export function toggleJournal() {
  journalOpen.value = !journalOpen.value;
}
