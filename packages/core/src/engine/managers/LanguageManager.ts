import type { TextEntry } from '../types';
import { interpolate } from '../utils/TimeHelper';
import { logger } from '../utils/logger';

/**
 * Manages language selection and text resolution.
 * Resolves TextEntry objects to the current language string.
 */
export class LanguageManager {
  private currentLang = 'en';
  private fallbackLang = 'en';

  /** Get current language */
  get language(): string {
    return this.currentLang;
  }

  /** Set current language */
  setLanguage(lang: string): void {
    this.currentLang = lang;
    logger.debug(`Language set to: ${lang}`);
  }

  /** Set fallback language */
  setFallback(lang: string): void {
    this.fallbackLang = lang;
  }

  /**
   * Resolve a text entry to a string in the current language.
   * If entry is already a string, return it as-is.
   * If it's a TextEntry record, look up current language, then fallback, then first key.
   */
  resolve(entry: string | TextEntry): string {
    if (typeof entry === 'string') return entry;

    return entry[this.currentLang]
      ?? entry[this.fallbackLang]
      ?? Object.values(entry)[0]
      ?? '';
  }

  /**
   * Resolve text with variable interpolation.
   * "{varName}" in the resolved string is replaced with the value from variables.
   */
  resolveWithVars(entry: string | TextEntry, variables: Record<string, string | number>): string {
    const text = this.resolve(entry);
    return interpolate(text, variables);
  }
}
