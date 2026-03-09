import { ref, computed } from 'vue';
import type { TextEntry } from '../engine/types';

const currentLanguage = ref<string>('en');

/** Update the reactive language ref. Called from setup when SettingsManager detects a change. */
export function setGlobalLanguage(lang: string): void {
  currentLanguage.value = lang;
}

/**
 * Composable for language management.
 */
export function useLanguage() {
  const language = computed(() => currentLanguage.value);

  function setLanguage(lang: string): void {
    currentLanguage.value = lang;
  }

  /**
   * Resolve a TextEntry to a string for the current language.
   * Falls back to 'en', then to the first available key.
   */
  function resolveText(entry: string | TextEntry): string {
    if (typeof entry === 'string') return entry;
    return (
      entry[currentLanguage.value] ??
      entry['en'] ??
      Object.values(entry)[0] ??
      ''
    );
  }

  return { language, setLanguage, resolveText };
}
