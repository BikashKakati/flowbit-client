import React from "react";
import { SOCIAL_PROOF_TESTIMONIALS } from "../../../constant";

export function SocialProofSection() {
    return (
        <section className="py-24 px-6 border-t border-slate-800/50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-block text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-4">
                        What teams say
                    </span>
                    <h2 className="text-4xl font-extrabold tracking-tight text-white">
                        Engineers who switched, stayed.
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {SOCIAL_PROOF_TESTIMONIALS.map((t) => (
                        <QuoteCard key={t.name} t={t} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function QuoteCard({ t }: { t: typeof SOCIAL_PROOF_TESTIMONIALS[0] }) {
    return (
        <div
            className="relative flex flex-col gap-6 p-7 rounded-2xl border border-slate-800/80 overflow-hidden transition-all duration-300 hover:border-slate-700/80 group bg-[linear-gradient(145deg,#0d1320_0%,#080d17_100%)]"
            style={{
                "--accent-color": t.accentColor,
                "--accent-glow": t.accentColor + "60",
                "--accent-bg": t.accentColor + "22",
                "--accent-border": t.accentColor + "44",
            } as React.CSSProperties}
        >
            <div className="absolute top-0 left-6 right-6 h-px bg-[linear-gradient(90deg,transparent,var(--accent-glow),transparent)]" />
            <span
                className="absolute top-5 right-6 text-5xl font-serif leading-none pointer-events-none select-none text-[color:var(--accent-color)] opacity-15"
                aria-hidden
            >
                "
            </span>
            <p className="text-slate-300 text-sm leading-relaxed relative z-10 flex-1">
                "{t.quote}"
            </p>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-[var(--accent-bg)] text-[color:var(--accent-color)] border border-[color:var(--accent-border)]">
                    {t.initials}
                </div>
                <div>
                    <p className="text-sm font-semibold text-white leading-none mb-0.5">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role} · {t.company}</p>
                </div>
            </div>
        </div>
    );
}