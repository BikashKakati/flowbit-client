import { Outlet } from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="h-full bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
            <Outlet />
        </div>
    );
}
