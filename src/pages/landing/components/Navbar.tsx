import { Link } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { useAuthStore } from "../../../store/auth-store";
import { Logo } from "../../../components/common/Logo";

export function Navbar() {
    const { isAuthenticated } = useAuthStore();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
            <Link to="/" className="hover:opacity-90 transition-opacity">
                <Logo size="md" />
            </Link>
            <div className="flex items-center gap-4">
                {!isAuthenticated && (
                    <Button to="/login" variant="outline" size="sm" className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200">
                        Sign In
                    </Button>
                )}
                <Button to="/space" variant="gradient" size="sm">
                    Open Spaces
                </Button>
            </div>
        </nav>
    );
}
