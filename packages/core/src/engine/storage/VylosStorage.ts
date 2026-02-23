import { logger } from '../utils/logger';

const DB_VERSION = 1;

/**
 * Low-level IndexedDB wrapper for Vylos.
 * One database per project, with typed object stores.
 *
 * Usage:
 *   const storage = new VylosStorage('my-project');
 *   await storage.open();
 *   await storage.put('saves', 1, { ... });
 *   const data = await storage.get('saves', 1);
 */
export class VylosStorage {
  private db: IDBDatabase | null = null;
  private dbName: string;

  static readonly STORES = ['saves', 'settings', 'cache'] as const;

  constructor(projectId = 'default') {
    this.dbName = `vylos_${projectId}`;
  }

  async open(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        for (const name of VylosStorage.STORES) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name);
          }
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        logger.debug(`VylosStorage opened: ${this.dbName}`);
        resolve();
      };

      request.onerror = () => {
        logger.error('VylosStorage open failed:', request.error);
        reject(request.error);
      };
    });
  }

  async put<T>(storeName: string, key: IDBValidKey, value: T): Promise<void> {
    const db = this.requireDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    const db = this.requireDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const db = this.requireDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async keys(storeName: string): Promise<IDBValidKey[]> {
    const db = this.requireDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).getAllKeys();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = this.requireDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = this.requireDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }

  async destroy(): Promise<void> {
    this.close();
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private requireDb(): IDBDatabase {
    if (!this.db) throw new Error('VylosStorage not opened. Call open() first.');
    return this.db;
  }
}
