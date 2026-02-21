import type { SaveSlot, SaveMeta } from '../types';
import { VylosStorage } from '../storage/VylosStorage';
import { logger } from '../utils/logger';

const SAVE_VERSION = 1;
const STORE = 'saves';

/**
 * Manages save/load with versioned IndexedDB slots.
 */
export class SaveManager {
  private storage: VylosStorage;
  private ready: Promise<void>;

  constructor(storage: VylosStorage) {
    this.storage = storage;
    this.ready = storage.open();
  }

  /** Save a complete slot (timestamp and version are set automatically) */
  async save(slot: number, saveData: Omit<SaveSlot, 'slot' | 'timestamp' | 'version'>): Promise<void> {
    await this.ready;
    const data: SaveSlot = {
      slot,
      timestamp: Date.now(),
      version: SAVE_VERSION,
      ...JSON.parse(JSON.stringify(saveData)),
    };

    try {
      await this.storage.put(STORE, slot, data);
      logger.info(`Saved to slot ${slot}`);
    } catch (error) {
      logger.error('Save failed:', error);
    }
  }

  /** Load game state from a slot */
  async load(slot: number): Promise<SaveSlot | null> {
    await this.ready;
    try {
      const data = await this.storage.get<SaveSlot>(STORE, slot);
      if (!data) return null;

      if (data.version !== SAVE_VERSION) {
        logger.warn(`Save version mismatch: expected ${SAVE_VERSION}, got ${data.version}`);
      }

      logger.info(`Loaded from slot ${slot}`);
      return data;
    } catch (error) {
      logger.error('Load failed:', error);
      return null;
    }
  }

  /** Delete a save slot */
  async delete(slot: number): Promise<void> {
    await this.ready;
    await this.storage.delete(STORE, slot);
    logger.info(`Deleted slot ${slot}`);
  }

  /** Get metadata for all save slots */
  async listSlots(): Promise<SaveMeta[]> {
    await this.ready;
    try {
      const all = await this.storage.getAll<SaveSlot>(STORE);
      return all.map(d => ({
        slot: d.slot,
        timestamp: d.timestamp,
        label: d.label,
        thumbnail: d.thumbnail,
      }));
    } catch {
      return [];
    }
  }

  /** Check if a slot has data */
  async hasSlot(slot: number): Promise<boolean> {
    await this.ready;
    const data = await this.storage.get(STORE, slot);
    return data !== undefined;
  }
}
