import { ArrowRight, Github } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { CTA_STATS } from "../../../constant";

export function CTASection() {
    return (
        <section className="relative py-36 px-6 overflow-hidden border-t border-slate-800/50">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.055)_1px,transparent_1px)] bg-[size:56px_56px]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_100%,rgba(99,102,241,0.14)_0%,rgba(139,92,246,0.08)_40%,transparent_70%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_30%,#070B14_90%)]"
            />
            <div className="relative max-w-3xl mx-auto text-center">
                <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
                    {CTA_STATS.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">{s.value}</span>
                            <span className="text-slate-600 text-sm">{s.label}</span>
                            {i < 2 && <span className="hidden sm:block w-px h-4 bg-slate-800 ml-2" />}
                        </div>
                    ))}
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-5">
                    Your next architecture diagram starts{" "}
                    <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#818cf8_0%,#a78bfa_50%,#38bdf8_100%)]">
                        right here.
                    </span>
                </h2>
                <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                    No installation, no credit card. Open a space and start mapping your system in seconds.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button to="/space" variant="gradient" size="lg" className="w-full sm:w-auto">
                        Open free workspace
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-medium text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition-all duration-200 w-full sm:w-auto justify-center"
                    >
                        <Github className="w-4 h-4" />
                        View on GitHub
                    </a>
                </div>
                <p className="mt-8 text-xs text-slate-600">
                    Free plan includes unlimited private spaces. No time limit.
                </p>
            </div>
        </section>
    );
}