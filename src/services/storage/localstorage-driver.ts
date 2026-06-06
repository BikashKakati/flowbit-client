import type { StorageDriver } from './driver';

export class LocalStorageDriver implements StorageDriver {
  private prefix: string;

  constructor(prefix = 'flowbit_ls_') {
    this.prefix = prefix;
  }

  private getKey(collection: string, key: string): string {
    return `${this.prefix}${collection}:${key}`;
  }

  async get<T>(collection: string, key: string): Promise<T | null> {
    try {
      const data = localStorage.getItem(this.getKey(collection, key));
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("LocalStorage read error", err);
      return null;
    }
  }

  async getAll<T>(collection: string): Promise<T[]> {
    const items: T[] = [];
    const targetPrefix = `${this.prefix}${collection}:`;
    for (let i = 0; i < localStorage.length; i++) {
      const rawKey = localStorage.key(i);
      if (rawKey && rawKey.startsWith(targetPrefix)) {
        try {
          const val = localStorage.getItem(rawKey);
          if (val) items.push(JSON.parse(val));
        } catch (e) {
          console.error("LocalStorage parse error for key", rawKey, e);
        }
      }
    }
    return items;
  }

  async set<T>(collection: string, key: string, data: T): Promise<void> {
    try {
      localStorage.setItem(this.getKey(collection, key), JSON.stringify(data));
    } catch (err) {
      console.error("LocalStorage write error", err);
    }
  }

  async delete(collection: string, key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(collection, key));
    } catch (err) {
      console.error("LocalStorage delete error", err);
    }
  }

  async batchSet<T>(collection: string, items: { id: string; data: T }[]): Promise<void> {
    for (const item of items) {
      await this.set(collection, item.id, item.data);
    }
  }

  async batchDelete(collection: string, keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.delete(collection, key);
    }
  }

  async query<T>(collection: string, predicate?: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll<T>(collection);
    if (predicate) {
      return all.filter(predicate);
    }
    return all;
  }

  async clear(collection: string): Promise<void> {
    const targetPrefix = `${this.prefix}${collection}:`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const rawKey = localStorage.key(i);
      if (rawKey && rawKey.startsWith(targetPrefix)) {
        keysToRemove.push(rawKey);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }

  async keys(collection: string): Promise<string[]> {
    const keys: string[] = [];
    const targetPrefix = `${this.prefix}${collection}:`;
    for (let i = 0; i < localStorage.length; i++) {
      const rawKey = localStorage.key(i);
      if (rawKey && rawKey.startsWith(targetPrefix)) {
        keys.push(rawKey.substring(targetPrefix.length));
      }
    }
    return keys;
  }
}

export const localStorageDriver = new LocalStorageDriver();
