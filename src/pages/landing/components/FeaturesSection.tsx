import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Download } from "lucide-react";
import { FEATURES_LIST, COLLABORATION_CURSORS, EXPORT_FORMATS } from "../../../constant";

function VisualNodes() {
    return (
        <div className="relative w-full h-64 rounded-xl bg-[#080d17] border border-slate-800/60 overflow-hidden p-4 select-none">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,#1e2d44_1px,transparent_1px)] bg-[size:22px_22px]" />
            <MiniNode label="Client" color="indigo" style={{ top: 36, left: 20 }} />
            <MiniNode label="Auth" color="violet" style={{ top: 36, left: 150 }} />
            <MiniNode label="API" color="cyan" style={{ top: 120, left: 90 }} />
            <MiniNode label="DB" color="indigo" style={{ top: 36, left: 280 }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" overflow="visible">
                <AnimEdge x1={86} y1={56} x2={150} y2={56} color="#6366f1" />
                <AnimEdge x1={70} y1={76} x2={124} y2={140} color="#22d3ee" />
                <AnimEdge x1={222} y1={56} x2={280} y2={56} color="#8b5cf6" />
                <AnimEdge x1={174} y1={140} x2={298} y2={76} color="#6366f1" />
            </svg>
            <span className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono">
                flowsbit canvas
            </span>
        </div>
    );
}

function MiniNode({ label, color, style }: { label: string; color: string; style: React.CSSProperties }) {
    const colors: Record<string, { border: string; dot: string; text: string }> = {
        indigo: { border: "#4f46e5", dot: "#818cf8", text: "#c7d2fe" },
        violet: { border: "#7c3aed", dot: "#a78bfa", text: "#ddd6fe" },
        cyan: { border: "#0891b2", dot: "#22d3ee", text: "#a5f3fc" },
    };
    const c = colors[color] ?? colors.indigo;
    return (
        <div
            className="absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[#0f1729] w-[68px] z-[2] border border-[color:var(--node-border)] shadow-[0_0_12px_var(--node-glow)] text-[color:var(--node-text)]"
            style={{
                ...style,
                "--node-border": `${c.border}55`,
                "--node-glow": `${c.border}30`,
                "--node-text": c.text,
                "--node-dot": c.dot,
            } as React.CSSProperties}
        >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse bg-[color:var(--node-dot)]" />
            {label}
        </div>
    );
}

function AnimEdge({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
    const id = `edge-${x1}-${y1}`;
    return (
        <>
            <defs>
                <marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill={color} opacity="0.7" />
                </marker>
            </defs>
            <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color}
                strokeWidth="1.5"
                strokeOpacity="0.5"
                strokeDasharray="4 3"
                markerEnd={`url(#${id})`}
            >
                <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.4s" repeatCount="indefinite" />
            </line>
        </>
    );
}

function VisualGrouping() {
    return (
        <div className="relative w-full h-64 rounded-xl bg-[#080d17] border border-slate-800/60 overflow-hidden select-none p-5">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,#1e2d44_1px,transparent_1px)] bg-[size:22px_22px]" />
            <div className="absolute top-6 left-6 right-6 bottom-6 rounded-xl border-2 border-dashed border-indigo-500/25 bg-[rgba(99,102,241,0.04)]">
                <span className="absolute -top-2.5 left-3 text-[10px] text-indigo-400/60 font-mono bg-[#080d17] px-1">
                    Services / Backend
                </span>
                <div className="absolute top-5 left-5 right-24 bottom-5 rounded-lg border border-dashed border-violet-500/25 bg-[rgba(139,92,246,0.04)]">
                    <span className="absolute -top-2 left-2 text-[10px] text-violet-400/60 font-mono bg-[#080d17] px-1">
                        Auth cluster
                    </span>
                    <div className="flex items-center gap-2 m-3 mt-4">
                        <GroupNode label="OAuth" />
                        <GroupNode label="JWT" />
                    </div>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <GroupNode label="Gateway" cyan />
                </div>
            </div>
        </div>
    );
}

function GroupNode({ label, cyan }: { label: string; cyan?: boolean }) {
    return (
        <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-[#0f1729] border border-solid ${cyan ? "border-[#0891b2]/33 text-[#67e8f9]" : "border-[#7c3aed]/33 text-[#c4b5fd]"}`}>
            {label}
        </div>
    );
}

function VisualCollaboration() {
    return (
        <div className="relative w-full h-64 rounded-xl bg-[#080d17] border border-slate-800/60 overflow-hidden select-none">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,#1e2d44_1px,transparent_1px)] bg-[size:22px_22px]" />
            <div className="absolute top-6 left-6 px-3 py-2 rounded-lg text-[11px] text-slate-400 font-medium bg-[#0f1729] border border-solid border-slate-700">
                User Flow
            </div>
            <div className="absolute top-6 right-10 px-3 py-2 rounded-lg text-[11px] text-indigo-300 font-medium bg-[#0f1729] border border-solid border-[#4f46e5]/33">
                API Layer
            </div>
            <div className="absolute bottom-10 left-20 px-3 py-2 rounded-lg text-[11px] text-violet-300 font-medium bg-[#0f1729] border border-solid border-[#7c3aed]/33">
                Database
            </div>
            {COLLABORATION_CURSORS.map((c) => (
                <div key={c.name} className="absolute" style={{ left: c.x, top: c.y }}>
                    <svg
                        width="16"
                        height="20"
                        viewBox="0 0 16 20"
                        fill="none"
                        className="[filter:drop-shadow(0_0_4px_var(--cursor-color))]"
                        style={{ "--cursor-color": c.color } as React.CSSProperties}
                    >
                        <path d="M2 2L14 8L8 10L6 16L2 2Z" fill={c.color} fillOpacity="0.9" />
                    </svg>
                    <div className="flex items-center gap-1.5 mt-0.5 ml-2">
                        <span
                            className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0 bg-[var(--cursor-bg)] text-[color:var(--cursor-color)] border border-[color:var(--cursor-border)]"
                            style={{
                                "--cursor-bg": c.color + "33",
                                "--cursor-color": c.color,
                                "--cursor-border": c.color + "66",
                            } as React.CSSProperties}
                        >
                            {c.name}
                        </span>
                        {c.label && (
                            <span className="text-[9px] text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded whitespace-nowrap">
                                {c.label}
                            </span>
                        )}
                    </div>
                </div>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-9 border-t border-slate-800/60 bg-slate-950/60 backdrop-blur flex items-center px-3 gap-2">
                <span className="text-[10px] text-slate-500">3 collaborators online</span>
                <div className="flex -space-x-1 ml-auto">
                    {COLLABORATION_CURSORS.map((c) => (
                        <span
                            key={c.name}
                            className="w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center ring-1 ring-slate-950 bg-[var(--cursor-bg)] text-[color:var(--cursor-color)]"
                            style={{
                                "--cursor-bg": c.color + "33",
                                "--cursor-color": c.color,
                            } as React.CSSProperties}
                        >
                            {c.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function VisualExport() {
    return (
        <div className="relative w-full h-64 rounded-xl bg-[#080d17] border border-slate-800/60 overflow-hidden select-none p-5 flex flex-col justify-center gap-3">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,#1e2d44_1px,transparent_1px)] bg-[size:22px_22px]" />
            {EXPORT_FORMATS.map((f, i) => (
                <div
                    key={f.ext}
                    className="relative z-10 flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0f1729] border border-[color:var(--format-border)]"
                    style={{
                        "--format-border": `${f.color}33`,
                        animationDelay: `${i * 0.1}s`,
                    } as React.CSSProperties}
                >
                    <span
                        className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-[var(--format-bg)] text-[color:var(--format-color)]"
                        style={{
                            "--format-bg": f.color + "15",
                            "--format-color": f.color,
                        } as React.CSSProperties}
                    >
                        {f.ext}
                    </span>
                    <div className="flex-1">
                        <p className="text-[11px] text-slate-300 font-medium">api-architecture.{f.ext.toLowerCase()}</p>
                        <p className="text-[10px] text-slate-600">{f.size}</p>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                </div>
            ))}
        </div>
    );
}

const visualMap = {
    nodes: <VisualNodes />,
    grouping: <VisualGrouping />,
    collaboration: <VisualCollaboration />,
    export: <VisualExport />,
};

export function FeaturesSection() {
    return (
        <section className="py-28 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-20">
                <span className="inline-block text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-4">
                    What you get
                </span>
                <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
                    Everything a diagramming tool<br className="hidden sm:block" /> should have been from day one.
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto text-lg">
                    Built for the way engineers actually think — systems first, detail second.
                </p>
            </div>
            <div className="flex flex-col gap-24">
                {FEATURES_LIST.map((f) => (
                    <FeatureRow
                        key={f.tag}
                        feature={{
                            ...f,
                            visual: visualMap[f.visualKey as keyof typeof visualMap],
                        }}
                    />
                ))}
            </div>
        </section>
    );
}

function FeatureRow({ feature: f }: { feature: any }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
            <div className={f.visualLeft ? "order-1 lg:order-1" : "order-1 lg:order-2"}>
                <div className="relative">
                    <div className="absolute -inset-px rounded-2xl pointer-events-none bg-[linear-gradient(135deg,rgba(99,102,241,0.15)_0%,rgba(139,92,246,0.08)_50%,rgba(34,211,238,0.06)_100%)]" />
                    {f.visual}
                </div>
            </div>
            <div className={`flex flex-col gap-5 ${f.visualLeft ? "order-2 lg:order-2" : "order-2 lg:order-1"}`}>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full border w-fit ${f.tagColor}`}>
                        <f.icon className={`w-3 h-3 ${f.iconColor}`} />
                        {f.tag}
                    </span>
                    {f.badge && (
                        <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400">
                            {f.badge}
                        </span>
                    )}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white leading-snug">
                    {f.title}
                </h3>
                <p className="text-slate-400 text-base leading-relaxed">
                    {f.body}
                </p>
                <ul className="flex flex-col gap-2.5">
                    {f.bullets.map((b: string) => (
                        <li key={b} className="flex items-center gap-2.5 text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            {b}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}