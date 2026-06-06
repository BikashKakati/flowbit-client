import { Outlet } from "react-router-dom";

export default function ProtectedLayout() {
    // Guest-first flow: Allow access to /space, /editor/:id, and /settings without authentication
    return (
        <Outlet />
    );
}
