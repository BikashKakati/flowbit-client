import { SyncQueueRepository } from './repository';
import { remoteDriver } from './remote-driver';
import { indexedDBDriver } from './indexeddb-driver';
import { localStorageDriver } from './localstorage-driver';
import type { Space } from '../api/space-service';
import type { FlowMetadata } from '../api/flow-service';
import type { CanvasData } from '../api/canvas-service';
import { useWorkspaceStore } from '../../store/workspace-store';
import { apiClient } from '../../config/api-client';

class ConnectivityTracker {
  private isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: ((online: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateStatus(true));
      window.addEventListener('offline', () => this.updateStatus(false));
    }
  }

  private updateStatus(status: boolean) {
    this.isOnlineStatus = status;
    this.listeners.forEach(l => l(status));
  }

  isOnline(): boolean {
    return this.isOnlineStatus;
  }

  onChange(listener: (online: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const connectivity = new ConnectivityTracker();

class SyncManagerClass {
  private isProcessing = false;

  constructor() {
    connectivity.onChange((online) => {
      if (online) {
        console.log("[SyncManager] Browser online. Starting background queue processing...");
        this.processQueue().catch(console.error);
      }
    });
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    if (!connectivity.isOnline()) return;

    this.isProcessing = true;
    console.debug("[SyncManager] Processing offline sync queue...");

    try {
      const ops = await SyncQueueRepository.getAll();
      if (ops.length === 0) {
        this.isProcessing = false;
        return;
      }

      for (const op of ops) {
        if (!connectivity.isOnline()) {
          console.debug("[SyncManager] Browser went offline during queue processing. Stopping.");
          break;
        }

        console.debug(`[SyncManager] Processing op ${op.action} for ${op.entityType} (${op.entityId})`);

        try {
          if (op.entityType === 'space') {
            if (op.action === 'create' || op.action === 'update') {
              await remoteDriver.set('spaces', op.entityId, op.payload);
            } else if (op.action === 'delete') {
              await remoteDriver.delete('spaces', op.entityId);
            }
            // Successful upload: Delete local IndexedDB copy to maintain clean online-first database state
            await indexedDBDriver.delete('spaces', op.entityId);
          } else if (op.entityType === 'flow') {
            if (op.action === 'create') {
              await remoteDriver.set('flows', op.entityId, op.payload);
            } else if (op.action === 'update') {
              await remoteDriver.set('flows', op.entityId, op.payload);
            } else if (op.action === 'delete') {
              await remoteDriver.delete('flows', op.entityId);
            }
            // Clean up IndexedDB
            await indexedDBDriver.delete('flows', op.entityId);
            if (op.action === 'delete') {
              await indexedDBDriver.delete('canvas', op.entityId);
            }
          } else if (op.entityType === 'canvas') {
            if (op.action === 'create') {
              await remoteDriver.set('canvas', op.entityId, op.payload);
            }
            // Clean up IndexedDB
            await indexedDBDriver.delete('canvas', op.entityId);
          }

          // Success: remove operation from queue
          await SyncQueueRepository.remove(op.id);
          console.debug(`[SyncManager] Op ${op.id} synced successfully and removed from queue.`);
        } catch (err: any) {
          const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.message === 'Network Error';
          
          if (isNetworkError) {
            console.warn("[SyncManager] Network error encountered. Retrying queue processing later.", err);
            await SyncQueueRepository.updateAttempts(op.id, op.attempts + 1);
            break; 
          } else {
            console.error(`[SyncManager] Non-recoverable error for op ${op.id}. Discarding operation.`, err);
            await SyncQueueRepository.remove(op.id);
          }
        }
      }
    } catch (err) {
      console.error("[SyncManager] Fatal error during queue processing", err);
    } finally {
      this.isProcessing = false;
    }
  }

  async migrateGuestData(): Promise<void> {
    console.log("[SyncManager] Initiating guest-to-account migration...");
    try {
      // 1. Query all local guest spaces, flows, and canvases
      const guestSpaces = await indexedDBDriver.query<Space>('spaces', s => s.userId === 'guest' || !s.userId);
      const guestFlows = await indexedDBDriver.query<FlowMetadata>('flows', f => f.userId === 'guest' || !f.userId);

      const migratedSpaces: Space[] = [];
      const migratedFlows: FlowMetadata[] = [];

      // 2. Upload guest data to remote database
      if (guestSpaces.length > 0) {
        for (const space of guestSpaces) {
          console.log(`[SyncManager] Migrating space: ${space.name} (${space.id})`);
          try {
            await remoteDriver.set('spaces', space.id, { name: space.name });
            migratedSpaces.push(space);
          } catch (err) {
            console.error(`[SyncManager] Failed to migrate space ${space.id} to remote`, err);
          }

          const spaceFlows = guestFlows.filter(f => f.spaceId === space.id);
          for (const flow of spaceFlows) {
            console.log(`[SyncManager] Migrating flow: ${flow.name} (${flow.id})`);
            try {
              await remoteDriver.set('flows', flow.id, { spaceId: space.id, name: flow.name });
              migratedFlows.push(flow);
              
              const canvas = await indexedDBDriver.get<CanvasData>('canvas', flow.id);
              if (canvas) {
                await remoteDriver.set('canvas', flow.id, { nodes: canvas.nodes, edges: canvas.edges });
              }
            } catch (err) {
              console.error(`[SyncManager] Failed to migrate flow ${flow.id} to remote`, err);
            }
          }
        }

        // 3. Clear IndexedDB guest data & history from LocalStorage
        for (const space of guestSpaces) {
          await indexedDBDriver.delete('spaces', space.id);
        }
        for (const flow of guestFlows) {
          await indexedDBDriver.delete('flows', flow.id);
          await indexedDBDriver.delete('canvas', flow.id);
          localStorageDriver.delete('history', flow.id);
        }
      }

      // 4. Fetch the user's existing remote spaces and flows from MongoDB
      const remoteSpaces = await remoteDriver.getAll<Space>('spaces');
      
      let allFlows = [...migratedFlows];
      const fetchedSpaceIds: string[] = [];

      // Combine migrated and remote spaces (avoid duplicates)
      const allSpaces = [...migratedSpaces];
      for (const rs of remoteSpaces) {
        if (!allSpaces.some(s => s.id === rs.id)) {
          allSpaces.push(rs);
        }
      }

      for (const space of allSpaces) {
        try {
          const res = await apiClient.get<{ success: boolean, data: FlowMetadata[] }>(`/spaces/${space.id}/flows`);
          const spaceFlows = res.data.data;
          // Merge flows avoiding duplicates
          for (const sf of spaceFlows) {
            if (!allFlows.some(f => f.id === sf.id)) {
              allFlows.push(sf);
            }
          }
          fetchedSpaceIds.push(space.id);
        } catch (err) {
          console.error(`[SyncManager] Failed to fetch remote flows for space ${space.id}`, err);
        }
      }

      // 5. Update useWorkspaceStore with the merged data
      useWorkspaceStore.setState({
        spaces: allSpaces,
        flows: allFlows,
        fetchedSpaceIds,
        activeSpaceId: allSpaces.length > 0 ? allSpaces[0].id : null
      });

      console.log("[SyncManager] Guest data successfully migrated, local cache cleaned, and Zustand updated.");
    } catch (err) {
      console.error("[SyncManager] Error migrating guest data", err);
    }
  }

  async clearLocalCache(): Promise<void> {
    console.log("[SyncManager] Clearing local user cache...");
    try {
      await indexedDBDriver.clear('spaces');
      await indexedDBDriver.clear('flows');
      await indexedDBDriver.clear('canvas');
      await indexedDBDriver.clear('history');
      await indexedDBDriver.clear('sync_queue');
      
      // Reset Zustand workspace store state on logout
      useWorkspaceStore.setState({
        spaces: [],
        flows: [],
        fetchedSpaceIds: [],
        activeSpaceId: null
      });

      console.log("[SyncManager] Local cache and Zustand workspace store cleared successfully.");
    } catch (err) {
      console.error("[SyncManager] Failed to clear local cache", err);
    }
  }
}

export const SyncManager = new SyncManagerClass();
