import { Button } from "../../../components/common/Button";
import { useAuthStore } from "../../../store/auth-store";

export function Navbar() {
    const { isAuthenticated } = useAuthStore();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">
                    Flows
                    <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#818cf8_0%,#a78bfa_40%,#38bdf8_100%)]">
                        bit
                    </span>
                </span>
            </div>
            <div className="flex items-center gap-4">
                {!isAuthenticated && (
                    <Button to="/login" variant="outline" size="sm" className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200">
                        Sign In
                    </Button>
                )}
                <Button to="/space" variant="primary" size="sm">
                    Open Spaces
                </Button>
            </div>
        </nav>
    );
}
