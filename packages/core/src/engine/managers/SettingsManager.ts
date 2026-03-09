import type { EngineSettings } from '../types';
import { VylosStorage } from '../storage/VylosStorage';
import { logger } from '../utils/logger';

const STORE = 'settings';
const SETTINGS_KEY = 'engine';

const DEFAULT_SETTINGS: EngineSettings = {
  textSpeed: 50,
  autoSpeed: 3,
  volume: { master: 80, music: 70, sfx: 80, voice: 100 },
  language: 'en',
  fullscreen: false,
};

/**
 * Manages engine settings via IndexedDB.
 * Settings are loaded once at startup and cached in memory.
 */
export class SettingsManager {
  private storage: VylosStorage;
  private ready: Promise<void>;
  private current: EngineSettings = { ...DEFAULT_SETTINGS };
  private onLanguageChange?: (lang: string) => void;

  constructor(storage: VylosStorage, onLanguageChange?: (lang: string) => void) {
    this.storage = storage;
    this.onLanguageChange = onLanguageChange;
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    await this.storage.open();
    try {
      const saved = await this.storage.get<EngineSettings>(STORE, SETTINGS_KEY);
      if (saved) {
        this.current = { ...DEFAULT_SETTINGS, ...saved };
        logger.debug('Settings loaded from IndexedDB');
      }
    } catch {
      logger.warn('Failed to load settings, using defaults');
    }
  }

  /** Wait until settings are loaded */
  async whenReady(): Promise<void> {
    await this.ready;
  }

  /** Get current settings (synchronous after init) */
  get settings(): EngineSettings {
    return this.current;
  }

  /** Update settings and persist */
  async update(partial: Partial<EngineSettings>): Promise<void> {
    await this.ready;
    const prevLang = this.current.language;
    this.current = JSON.parse(JSON.stringify({ ...this.current, ...partial }));
    try {
      await this.storage.put(STORE, SETTINGS_KEY, this.current);
      logger.debug('Settings saved');
    } catch (error) {
      logger.error('Settings save failed:', error);
    }
    if (this.current.language !== prevLang && this.onLanguageChange) {
      this.onLanguageChange(this.current.language);
    }
  }

  /** Reset to defaults */
  async reset(): Promise<void> {
    this.current = { ...DEFAULT_SETTINGS };
    await this.storage.put(STORE, SETTINGS_KEY, this.current);
  }
}
