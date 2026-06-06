export interface StorageDriver {
  get<T>(collection: string, key: string): Promise<T | null>;
  getAll<T>(collection: string): Promise<T[]>;
  set<T>(collection: string, key: string, data: T): Promise<void>;
  delete(collection: string, key: string): Promise<void>;
  
  batchSet<T>(collection: string, items: { id: string; data: T }[]): Promise<void>;
  batchDelete(collection: string, keys: string[]): Promise<void>;
  
  query<T>(collection: string, predicate?: (item: T) => boolean): Promise<T[]>;
  clear(collection: string): Promise<void>;
  keys(collection: string): Promise<string[]>;
}
