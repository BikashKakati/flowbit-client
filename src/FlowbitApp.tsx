import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/Router";
import { useAuthStore } from "./store/auth-store";
import { AuthService } from "./services/api/auth-service";

const FlowbitApp: React.FC = () => {
  const logout = useAuthStore(state => state.logout);

    useEffect(() => {
        const handleLogout = () => {
            logout();
            window.location.href = '/login';
        };
        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, [logout]);

    useEffect(() => {
        const { isAuthenticated, user, updateUser, logout } = useAuthStore.getState();
        
        if (isAuthenticated && !user) {
            AuthService.getCurrentProfile()
                .then((profile) => {
                    updateUser(profile);
                    // Start processing sync manager queue
                    import("./services/storage/sync-manager")
                        .then(({ SyncManager }) => {
                            SyncManager.processQueue().catch(console.error);
                        })
                        .catch(console.error);
                })
                .catch((err) => {
                    console.error("Failed to restore authenticated session, logging out", err);
                    logout();
                });
        } else if (isAuthenticated) {
            import("./services/storage/sync-manager")
                .then(({ SyncManager }) => {
                    SyncManager.processQueue().catch(console.error);
                })
                .catch(console.error);
        }
    }, []);

  return (
    <RouterProvider router={router} />
  );
};

export default FlowbitApp;
