import { useCallback } from "react";
import { ReactFlow, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant, Handle, Position } from "@xyflow/react";
import type { Connection, Edge } from "@xyflow/react";
import { Button } from "../../../components/common/Button";
import { ArrowRight, GitBranch, Layers, Zap, Users, Github } from "lucide-react";
import { HERO_CANVAS_NODES, HERO_CANVAS_EDGES, HERO_COLOR_MAP } from "../../../constant";

function HeroNode({ data }: any) {
    const c = HERO_COLOR_MAP[data.color] ?? HERO_COLOR_MAP.indigo;
    return (
        <div
            className={`relative w-36 h-10 rounded-lg flex items-center gap-2 px-3 bg-slate-900/90 backdrop-blur border ${c.border} ${c.glow} transition-all duration-300`}
        >
            <Handle type="target" position={Position.Left} className="!w-1.5 !h-1.5 !bg-slate-500 !border-none !-left-[3px]" />
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot} animate-pulse`} />
            <span className="text-xs font-medium text-slate-200 truncate">{data.label}</span>
            <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !bg-slate-500 !border-none !-right-[3px]" />
        </div>
    );
}

const nodeTypes = { hero: HeroNode };

function FloatingChip({
    icon: Icon,
    label,
    value,
    style,
    accentClass,
    entranceDelay = "0s",
}: {
    icon: any;
    label: string;
    value: string;
    style: React.CSSProperties;
    accentClass: string;
    entranceDelay?: string;
}) {
    const { top, left, right, bottom } = style;
    const positionStyle = { top, left, right, bottom };

    return (
        <div
            className="absolute z-20 opacity-0 animate-fade-in-up"
            style={{ ...positionStyle, animationDelay: entranceDelay } as React.CSSProperties}
        >
            <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl shadow-xl pointer-events-none select-none animate-chip-float"
                style={{ animationDelay: style.animationDelay ?? "0s" } as React.CSSProperties}
            >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${accentClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 leading-none mb-0.5">{label}</p>
                    <p className="text-xs font-semibold text-slate-200 leading-none">{value}</p>
                </div>
            </div>
        </div>
    );
}

export function HeroSection() {
    const [nodes, , onNodesChange] = useNodesState(HERO_CANVAS_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(HERO_CANVAS_EDGES);

    const onConnect = useCallback(
        (params: Connection | Edge) =>
            setEdges((eds) =>
                addEdge({ ...params, animated: true, style: { stroke: "#8b5cf6", strokeWidth: 2 } } as Edge, eds)
            ),
        [setEdges]
    );

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:56px_56px]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent_30%,#070B14_100%)]"
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/12 rounded-full blur-[140px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-xs text-indigo-300 font-medium tracking-wide">Visual system design — now in real-time</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.04] mb-6">
                        <span className="text-white">Think in</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#818cf8_0%,#a78bfa_40%,#38bdf8_100%)]">
                            connected
                        </span>
                        <br />
                        <span className="text-white">flows.</span>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-10">
                        Design architectures, map logic, and share structured ideas — on an
                        infinitely flexible canvas built for developers who think visually.
                    </p>
                    <div className="flex flex-col sm:flex-row items-start gap-3 mb-12">
                        <Button to="/space" variant="gradient" size="lg" className="opacity-0 animate-fade-in-up [animation-delay:300ms]">
                            Start building free
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-medium text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition-all duration-200 w-full sm:w-auto justify-center opacity-0 animate-fade-in-up [animation-delay:450ms]"
                        >
                            <Github className="w-4 h-4" />
                            View on GitHub
                        </a>
                    </div>
                    <div className="flex items-center gap-5 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-300 font-semibold">12k+</span> diagrams created
                        </div>
                        <span className="w-px h-4 bg-slate-800" />
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-300 font-semibold">No credit card</span> required
                        </div>
                        <span className="w-px h-4 bg-slate-800" />
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-300 font-semibold">Free</span> forever plan
                        </div>
                    </div>
                </div>
                <div className="relative flex items-center justify-center">
                    <div
                        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800/80 bg-[linear-gradient(145deg,#0d1320_0%,#090e1a_100%)] shadow-[0_0_0_1px_rgba(99,102,241,0.12),0_32px_80px_rgba(0,0,0,0.6),0_0_80px_rgba(99,102,241,0.08)] opacity-0 animate-fade-in-up [animation-delay:200ms]"
                    >
                        <div className="absolute top-0 left-0 right-0 h-9 border-b border-white/5 bg-slate-950/70 backdrop-blur flex items-center px-3 gap-2 z-10">
                            <div className="flex gap-1.5 mr-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                            </div>
                            <div className="flex-1 h-5 bg-slate-800/60 rounded text-[10px] text-slate-600 flex items-center px-2">
                                flowsbit / api-architecture
                            </div>
                            <div className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-sm bg-indigo-400/60" />
                            </div>
                        </div>
                        <div className="absolute inset-0 pt-9">
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                nodeTypes={nodeTypes}
                                fitView
                                fitViewOptions={{ padding: 0.28 }}
                                proOptions={{ hideAttribution: true }}
                                zoomOnScroll={false}
                                panOnScroll={false}
                                elementsSelectable
                                className="bg-transparent"
                            >
                                <Background
                                    variant={BackgroundVariant.Dots}
                                    gap={22}
                                    size={1}
                                    color="#1e2a3d"
                                />
                            </ReactFlow>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none z-10" />
                    </div>
                    <FloatingChip
                        icon={GitBranch}
                        label="Connected nodes"
                        value="5 nodes · 4 edges"
                        accentClass="bg-indigo-500/15 text-indigo-400"
                        style={{ top: "-18px", left: "70px" }}
                        entranceDelay="400ms"
                    />
                    <FloatingChip
                        icon={Zap}
                        label="Auto-layout"
                        value="Dagre · Active"
                        accentClass="bg-violet-500/15 text-violet-400"
                        style={{ top: "30%", right: "-28px", animationDelay: "0.6s" }}
                        entranceDelay="550ms"
                    />
                    <FloatingChip
                        icon={Users}
                        label="Live collaborators"
                        value="3 editing now"
                        accentClass="bg-cyan-500/15 text-cyan-400"
                        style={{ bottom: "22%", left: "-24px", animationDelay: "1.1s" }}
                        entranceDelay="700ms"
                    />
                    <FloatingChip
                        icon={Layers}
                        label="Canvas layers"
                        value="Grouped · 2 frames"
                        accentClass="bg-indigo-500/15 text-indigo-400"
                        style={{ bottom: "-14px", right: "10%", animationDelay: "1.7s" }}
                        entranceDelay="850ms"
                    />
                    <div className="absolute -top-3 -right-3 w-20 h-20 opacity-30 bg-[radial-gradient(circle,rgba(139,92,246,0.6)_0%,transparent_70%)]" />
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 opacity-20 bg-[radial-gradient(circle,rgba(34,211,238,0.5)_0%,transparent_70%)]" />
                </div>
            </div>
        </section>
    );
}