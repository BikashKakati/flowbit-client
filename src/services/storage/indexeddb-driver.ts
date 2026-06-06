import type { StorageDriver } from './driver';

export class IndexedDBDriver implements StorageDriver {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null = null;

  constructor(dbName = 'flowbit_db', dbVersion = 1) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('spaces')) {
          db.createObjectStore('spaces', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('flows')) {
          const flowStore = db.createObjectStore('flows', { keyPath: 'id' });
          flowStore.createIndex('spaceId', 'spaceId', { unique: false });
        }
        if (!db.objectStoreNames.contains('canvas')) {
          db.createObjectStore('canvas', { keyPath: 'flowId' });
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'flowId' });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async get<T>(collection: string, key: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(collection, 'readonly');
        const store = tx.objectStore(collection);
        const req = store.get(key);
        req.onsuccess = () => {
          resolve(req.result || null);
        };
        req.onerror = () => {
          reject(req.error);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  async getAll<T>(collection: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(collection, 'readonly');
        const store = tx.objectStore(collection);
        const req = store.getAll();
        req.onsuccess = () => {
          resolve(req.result || []);
        };
        req.onerror = () => {
          reject(req.error);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  async set<T>(collection: string, key: string, data: T): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(collection, 'readwrite');
        const store = tx.objectStore(collection);
        const payload = { ...data };
        if (collection === 'canvas' || collection === 'history') {
          (payload as any).flowId = key;
        } else if (collection === 'spaces' || collection === 'flows' || collection === 'sync_queue') {
          (payload as any).id = key;
        }
        store.put(payload);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async delete(collection: string, key: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(collection, 'readwrite');
        const store = tx.objectStore(collection);
        store.delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async batchSet<T>(collection: string, items: { id: string; data: T }[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(collection, 'readwrite');
        const store = tx.objectStore(collection);
        for (const item of items) {
          const payload = { ...item.data };
          if (collection === 'canvas' || collection === 'history') {
            (payload as any).flowId = item.id;
          } else if (collection === 'spaces' || collection === 'flows' || collection === 'sync_queue') {
            (payload as any).id = item.id;
          }
          store.put(payload);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async batchDelete(collection: string, keys: string[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(collection, 'readwrite');
        const store = tx.objectStore(collection);
        for (const key of keys) {
          store.delete(key);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async query<T>(collection: string, predicate?: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll<T>(collection);
    if (predicate) {
      return all.filter(predicate);
    }
    return all;
  }

  async clear(collection: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(collection, 'readwrite');
        const store = tx.objectStore(collection);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async keys(collection: string): Promise<string[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(collection, 'readonly');
        const store = tx.objectStore(collection);
        const req = store.getAllKeys();
        req.onsuccess = () => {
          resolve(req.result.map(k => String(k)) || []);
        };
        req.onerror = () => {
          reject(req.error);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const indexedDBDriver = new IndexedDBDriver();
