import { indexedDBDriver } from './indexeddb-driver';
import { localStorageDriver } from './localstorage-driver';
import { remoteDriver } from './remote-driver';
import { useAuthStore } from '../../store/auth-store';
import { connectivity } from './sync-manager';
import type { Space } from '../api/space-service';
import type { FlowMetadata } from '../api/flow-service';
import type { CanvasData } from '../api/canvas-service';
import type { FlowHistoryData } from '../local/history-service';
import { v4 as uuidv4 } from 'uuid';
import { apiClient } from '../../config/api-client';

export interface SyncOperation {
  id: string;
  entityType: 'space' | 'flow' | 'canvas';
  action: 'create' | 'update' | 'delete';
  entityId: string;
  payload: any;
  timestamp: number;
  attempts: number;
}

// Durable sync queue repository
export const SyncQueueRepository = {
  async getAll(): Promise<SyncOperation[]> {
    const list = await indexedDBDriver.getAll<SyncOperation>('sync_queue');
    return list.sort((a, b) => a.timestamp - b.timestamp);
  },

  async add(op: SyncOperation): Promise<void> {
    // Coalesce canvas saves for the same flow
    if (op.entityType === 'canvas' && op.action === 'create') {
      const existing = await indexedDBDriver.query<SyncOperation>('sync_queue',
        o => o.entityType === 'canvas' && o.entityId === op.entityId
      );
      if (existing.length > 0) {
        const match = existing[0];
        match.payload = op.payload;
        match.timestamp = op.timestamp;
        await indexedDBDriver.set('sync_queue', match.id, match);
        return;
      }
    }

    // Coalesce space or flow updates
    if ((op.entityType === 'space' || op.entityType === 'flow') && op.action === 'update') {
      const existing = await indexedDBDriver.query<SyncOperation>('sync_queue',
        o => o.entityType === op.entityType && o.entityId === op.entityId && o.action === 'update'
      );
      if (existing.length > 0) {
        const match = existing[0];
        match.payload = op.payload;
        match.timestamp = op.timestamp;
        await indexedDBDriver.set('sync_queue', match.id, match);
        return;
      }
    }

    await indexedDBDriver.set('sync_queue', op.id, op);
  },

  async remove(id: string): Promise<void> {
    await indexedDBDriver.delete('sync_queue', id);
  },

  async updateAttempts(id: string, attempts: number): Promise<void> {
    const op = await indexedDBDriver.get<SyncOperation>('sync_queue', id);
    if (op) {
      op.attempts = attempts;
      await indexedDBDriver.set('sync_queue', id, op);
    }
  }
};

// Abstracted Space operations
export const SpaceRepository = {
  async getSpaces(): Promise<Space[]> {
    const { isAuthenticated, user } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest: local only
      return indexedDBDriver.query<Space>('spaces', s => s.userId === 'guest' || !s.userId);
    }

    // Authenticated user
    const userId = user?.id || '';
    if (connectivity.isOnline()) {
      try {
        const spaces = await remoteDriver.getAll<Space>('spaces');
        // Do NOT cache locally in IndexedDB as per online-first policy
        return spaces;
      } catch (err) {
        console.error("Failed to load spaces from remote, falling back to local cache", err);
      }
    }

    // Offline or failed request: return local cache
    return indexedDBDriver.query<Space>('spaces', s => s.userId === userId);
  },

  async createSpace(id: string, name: string): Promise<Space> {
    const { isAuthenticated, user } = useAuthStore.getState();
    const userId = isAuthenticated && user ? user.id : 'guest';
    const now = new Date().toISOString();

    const space: Space = {
      id,
      userId,
      name,
      createdAt: now,
      updatedAt: now
    };

    if (!isAuthenticated) {
      // Guest: save to IndexedDB only
      await indexedDBDriver.set('spaces', id, space);
      return space;
    }

    // Authenticated
    if (connectivity.isOnline()) {
      // Directly save in the backend, bypassing IndexedDB
      await remoteDriver.set('spaces', id, space);
    } else {
      // Offline mode: save in IndexedDB and queue sync action
      await indexedDBDriver.set('spaces', id, space);
      await SyncQueueRepository.add({
        id: uuidv4(),
        entityType: 'space',
        action: 'create',
        entityId: id,
        payload: { name },
        timestamp: Date.now(),
        attempts: 0
      });
    }

    return space;
  },

  async updateSpace(id: string, newName: string): Promise<Space> {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest: update local IndexedDB
      const local = await indexedDBDriver.get<Space>('spaces', id);
      if (!local) throw new Error("Space not found locally");
      const updated = { ...local, name: newName, updatedAt: new Date().toISOString() };
      await indexedDBDriver.set('spaces', id, updated);
      return updated;
    }

    // Authenticated
    if (connectivity.isOnline()) {
      // Directly update on backend, bypassing IndexedDB
      await remoteDriver.set('spaces', id, { name: newName });
      return {
        id,
        name: newName,
        userId: useAuthStore.getState().user?.id || '',
        createdAt: '',
        updatedAt: new Date().toISOString()
      };
    } else {
      // Offline mode: update IndexedDB and sync queue
      const local = await indexedDBDriver.get<Space>('spaces', id);
      if (!local) throw new Error("Space not found locally");
      const updated = { ...local, name: newName, updatedAt: new Date().toISOString() };
      await indexedDBDriver.set('spaces', id, updated);
      await SyncQueueRepository.add({
        id: uuidv4(),
        entityType: 'space',
        action: 'update',
        entityId: id,
        payload: { name: newName },
        timestamp: Date.now(),
        attempts: 0
      });
      return updated;
    }
  },

  async deleteSpace(id: string): Promise<void> {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest: delete from IndexedDB only
      await indexedDBDriver.delete('spaces', id);
      const flows = await indexedDBDriver.query<FlowMetadata>('flows', f => f.spaceId === id);
      for (const flow of flows) {
        await indexedDBDriver.delete('flows', flow.id);
        await indexedDBDriver.delete('canvas', flow.id);
        localStorageDriver.delete('history', flow.id);
      }
      return;
    }

    // Authenticated
    if (connectivity.isOnline()) {
      // Directly delete from remote database and clean up IndexedDB if cached offline
      await remoteDriver.delete('spaces', id);
      await indexedDBDriver.delete('spaces', id);
      const flows = await indexedDBDriver.query<FlowMetadata>('flows', f => f.spaceId === id);
      for (const flow of flows) {
        await indexedDBDriver.delete('flows', flow.id);
        await indexedDBDriver.delete('canvas', flow.id);
        localStorageDriver.delete('history', flow.id);
      }
    } else {
      // Offline mode: delete from IndexedDB and add to sync queue
      await indexedDBDriver.delete('spaces', id);
      const flows = await indexedDBDriver.query<FlowMetadata>('flows', f => f.spaceId === id);
      for (const flow of flows) {
        await indexedDBDriver.delete('flows', flow.id);
        await indexedDBDriver.delete('canvas', flow.id);
        localStorageDriver.delete('history', flow.id);
      }
      await SyncQueueRepository.add({
        id: uuidv4(),
        entityType: 'space',
        action: 'delete',
        entityId: id,
        payload: null,
        timestamp: Date.now(),
        attempts: 0
      });
    }
  }
};

// Abstracted Flow operations
export const FlowRepository = {
  async getFlowsBySpace(spaceId: string): Promise<FlowMetadata[]> {
    const { isAuthenticated, user } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest: local only
      return indexedDBDriver.query<FlowMetadata>('flows', f => f.spaceId === spaceId);
    }

    // Authenticated
    const userId = user?.id || '';
    if (connectivity.isOnline()) {
      try {
        const response = await apiClient.get<{ success: boolean, data: FlowMetadata[] }>(`/spaces/${spaceId}/flows`);
        // Do NOT cache locally in IndexedDB as per online-first policy
        return response.data.data;
      } catch (err) {
        console.error("Failed to load remote flows, using local cache", err);
      }
    }

    // Offline or failed: return local cache
    return indexedDBDriver.query<FlowMetadata>('flows', f => f.spaceId === spaceId && f.userId === userId);
  },

  async createFlow(spaceId: string, id: string, name: string): Promise<FlowMetadata> {
    const { isAuthenticated, user } = useAuthStore.getState();
    const userId = isAuthenticated && user ? user.id : 'guest';
    const now = new Date().toISOString();

    const flow: FlowMetadata = {
      id,
      spaceId,
      userId,
      name,
      createdAt: now,
      updatedAt: now
    };

    if (!isAuthenticated) {
      // Guest: save to IndexedDB only
      await indexedDBDriver.set('flows', id, flow);
      return flow;
    }

    // Authenticated
    if (connectivity.isOnline()) {
      // Directly save in the backend, bypassing IndexedDB
      await remoteDriver.set('flows', id, flow);
    } else {
      // Offline mode: save in IndexedDB and queue sync action
      await indexedDBDriver.set('flows', id, flow);
      await SyncQueueRepository.add({
        id: uuidv4(),
        entityType: 'flow',
        action: 'create',
        entityId: id,
        payload: { spaceId, name },
        timestamp: Date.now(),
        attempts: 0
      });
    }

    return flow;
  },

  async updateFlowName(id: string, name: string): Promise<FlowMetadata> {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest: update local IndexedDB
      const local = await indexedDBDriver.get<FlowMetadata>('flows', id);
      if (!local) throw new Error("Flow not found locally");
      const updated = { ...local, name, updatedAt: new Date().toISOString() };
      await indexedDBDriver.set('flows', id, updated);
      return updated;
    }

    // Authenticated
    if (connectivity.isOnline()) {
      // Directly update in the backend, bypassing IndexedDB
      await remoteDriver.set('flows', id, { name });
      return {
        id,
        name,
        spaceId: '',
        userId: useAuthStore.getState().user?.id || '',
        createdAt: '',
        updatedAt: new Date().toISOString()
      };
    } else {
      // Offline mode: update IndexedDB and sync queue
      const local = await indexedDBDriver.get<FlowMetadata>('flows', id);
      if (!local) throw new Error("Flow not found locally");
      const updated = { ...local, name, updatedAt: new Date().toISOString() };
      await indexedDBDriver.set('flows', id, updated);
      await SyncQueueRepository.add({
        id: uuidv4(),
        entityType: 'flow',
        action: 'update',
        entityId: id,
        payload: { name },
        timestamp: Date.now(),
        attempts: 0
      });
      return updated;
    }
  },

  async deleteFlow(id: string): Promise<void> {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest: delete from IndexedDB only
      await indexedDBDriver.delete('flows', id);
      await indexedDBDriver.delete('canvas', id);
      localStorageDriver.delete('history', id);
      return;
    }

    // Authenticated
    if (connectivity.isOnline()) {
      // Directly delete from remote database and clean up IndexedDB if cached
      await remoteDriver.delete('flows', id);
      await indexedDBDriver.delete('flows', id);
      await indexedDBDriver.delete('canvas', id);
      localStorageDriver.delete('history', id);
    } else {
      // Offline mode: delete from IndexedDB and add to sync queue
      await indexedDBDriver.delete('flows', id);
      await indexedDBDriver.delete('canvas', id);
      localStorageDriver.delete('history', id);
      await SyncQueueRepository.add({
        id: uuidv4(),
        entityType: 'flow',
        action: 'delete',
        entityId: id,
        payload: null,
        timestamp: Date.now(),
        attempts: 0
      });
    }
  }
};

// Abstracted Canvas operations
export const CanvasRepository = {
  async getCanvasContent(flowId: string): Promise<CanvasData> {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest: local only
      const canvas = await indexedDBDriver.get<CanvasData>('canvas', flowId);
      return canvas || { nodes: [], edges: [] };
    }

    // Authenticated
    if (connectivity.isOnline()) {
      try {
        const content = await remoteDriver.get<CanvasData>('canvas', flowId);
        // Do NOT cache locally in IndexedDB as per online-first policy
        return content || { nodes: [], edges: [] };
      } catch (err) {
        console.error("Failed to load remote canvas content, using local cache", err);
      }
    }

    // Offline or failed request: return local cache
    const local = await indexedDBDriver.get<CanvasData>('canvas', flowId);
    return local || { nodes: [], edges: [] };
  },

  async saveCanvasContent(flowId: string, nodes: any[], edges: any[]): Promise<void> {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest: save to IndexedDB only
      await indexedDBDriver.set('canvas', flowId, { nodes, edges });
      return;
    }

    // Authenticated
    if (connectivity.isOnline()) {
      // Directly save to remote database, bypassing IndexedDB
      await remoteDriver.set('canvas', flowId, { nodes, edges });
    } else {
      // Offline mode: save to IndexedDB and queue/coalesce sync action
      await indexedDBDriver.set('canvas', flowId, { nodes, edges });
      await SyncQueueRepository.add({
        id: uuidv4(),
        entityType: 'canvas',
        action: 'create',
        entityId: flowId,
        payload: { nodes, edges },
        timestamp: Date.now(),
        attempts: 0
      });
    }
  }
};

// Configurable history storage driver
const historyDriver = localStorageDriver;

export const HistoryRepository = {
  async getHistory(flowId: string): Promise<FlowHistoryData> {
    const data = await historyDriver.get<FlowHistoryData>('history', flowId);
    return data || { past: [], future: [] };
  },

  async saveHistory(flowId: string, history: FlowHistoryData): Promise<void> {
    await historyDriver.set('history', flowId, history);
  },

  async clearHistory(flowId: string): Promise<void> {
    await historyDriver.delete('history', flowId);
  }
};
