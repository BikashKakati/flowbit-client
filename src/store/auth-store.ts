import { create } from 'zustand';
import type { User } from '../services/api/auth-service';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    updateUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('flowbit_token'),
    isAuthenticated: !!localStorage.getItem('flowbit_token'),

    setAuth: (user, token) => {
        localStorage.setItem('flowbit_token', token);
        set({ user, token, isAuthenticated: true });

        // Dynamically import SyncManager to break circular dependencies
        import('../services/storage/sync-manager')
            .then(({ SyncManager }) => {
                // 1. Migrate guest data to remote
                SyncManager.migrateGuestData().catch(err => {
                    console.error("Failed to migrate guest data post-login", err);
                });
                // 2. Start processing any queued offline actions
                SyncManager.processQueue().catch(err => {
                    console.error("Failed to start sync queue post-login", err);
                });
            })
            .catch(err => {
                console.error("Failed to load SyncManager post-login", err);
            });
    },

    updateUser: (user) => {
        set({ user });
    },

    logout: () => {
        localStorage.removeItem('flowbit_token');
        set({ user: null, token: null, isAuthenticated: false });

        // Dynamically import SyncManager and clear local cache
        import('../services/storage/sync-manager')
            .then(({ SyncManager }) => {
                SyncManager.clearLocalCache().catch(err => {
                    console.error("Failed to clear local cache on logout", err);
                });
            })
            .catch(err => {
                console.error("Failed to load SyncManager on logout", err);
            });
    },
}));
