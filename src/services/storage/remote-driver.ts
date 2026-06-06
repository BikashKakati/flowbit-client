import type { StorageDriver } from './driver';
import { apiClient } from '../../config/api-client';

export class RemoteDriver implements StorageDriver {
  async get<T>(collection: string, key: string): Promise<T | null> {
    try {
      if (collection === 'spaces') {
        const res = await apiClient.get<{ success: boolean, data: any[] }>('/spaces');
        const list = res.data.data;
        return (list.find(s => s.id === key) as T) || null;
      }
      if (collection === 'canvas') {
        const res = await apiClient.get<{ success: boolean, data: T }>(`/flows/${key}/canvas`);
        return res.data.data;
      }
      return null;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  }

  async getAll<T>(collection: string): Promise<T[]> {
    if (collection === 'spaces') {
      const res = await apiClient.get<{ success: boolean, data: T[] }>('/spaces');
      return res.data.data;
    }
    return [];
  }

  async set<T>(collection: string, key: string, data: T): Promise<void> {
    if (collection === 'spaces') {
      const payload = data as any;
      try {
        await apiClient.post('/spaces', { id: key, name: payload.name });
      } catch (err: any) {
        if (err.response?.status === 409 || err.response?.status === 400) {
          await apiClient.put(`/spaces/${key}`, { name: payload.name });
        } else {
          throw err;
        }
      }
    } else if (collection === 'flows') {
      const payload = data as any;
      try {
        await apiClient.post(`/spaces/${payload.spaceId}/flows`, { id: key, name: payload.name });
      } catch (err: any) {
        if (err.response?.status === 409 || err.response?.status === 400) {
          await apiClient.put(`/flows/${key}/name`, { name: payload.name });
        } else {
          throw err;
        }
      }
    } else if (collection === 'canvas') {
      const payload = data as any;
      await apiClient.post(`/flows/${key}/canvas`, { nodes: payload.nodes, edges: payload.edges });
    }
  }

  async delete(collection: string, key: string): Promise<void> {
    if (collection === 'spaces') {
      await apiClient.delete(`/spaces/${key}`);
    } else if (collection === 'flows') {
      await apiClient.delete(`/flows/${key}`);
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
    return predicate ? all.filter(predicate) : all;
  }

  async clear(_collection: string): Promise<void> {
    // No-op for remote
  }

  async keys(_collection: string): Promise<string[]> {
    return [];
  }
}

export const remoteDriver = new RemoteDriver();
