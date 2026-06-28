import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactFlow, Background, useNodesState, useEdgesState, BackgroundVariant, Handle, Position } from "@xyflow/react";
import { AuthService } from '../../services/api/auth-service';
import { useAuthStore } from '../../store/auth-store';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { Loader2, Mail, Lock, Eye, EyeOff, User, ArrowLeft, GitBranch, Zap, Users, Layers } from 'lucide-react';
import { HERO_CANVAS_NODES, HERO_CANVAS_EDGES, HERO_COLOR_MAP } from '../../constant';

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

export default function SignupPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [nodes, , onNodesChange] = useNodesState(HERO_CANVAS_NODES);
    const [edges, , onEdgesChange] = useEdgesState(HERO_CANVAS_EDGES);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await AuthService.signup(email, password, name);
            setAuth(data.user, data.token);
            navigate('/space');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to create account';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full bg-slate-950 text-white flex select-none font-sans overflow-hidden">
            {/* Left Panel - Hero/Showcase (Visible on lg and larger) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900/30 border-r border-slate-800/60 flex-col justify-between p-10 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

                {/* Left Side Tagline Header */}
                <div className="z-10 w-full max-w-md mx-auto space-y-12 my-auto">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                            Build systems with a{' '}
                            <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#818cf8_0%,#a78bfa_40%,#38bdf8_100%)]">
                                visual canvas.
                            </span>
                        </h2>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                            Connect API requests, conditional logic, and server actions on an{' '}
                            <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#818cf8_0%,#a78bfa_40%,#38bdf8_100%)] font-semibold">
                                intuitive builder.
                            </span>
                        </p>
                    </div>

                    {/* Main Visual Representation (Visual Canvas Mockup matching Hero right side) */}
                    <div className="relative w-full aspect-[4/3] flex items-center justify-center mt-6">
                        <div
                            className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800/80 bg-[linear-gradient(145deg,#0d1320_0%,#090e1a_100%)] shadow-[0_0_0_1px_rgba(99,102,241,0.12),0_32px_80px_rgba(0,0,0,0.6),0_0_80px_rgba(99,102,241,0.08)]"
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
                            style={{ top: "-18px", left: "40px" }}
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

                {/* Footer text */}
                <div className="text-xs text-slate-600 mt-auto">
                    &copy; {new Date().getFullYear()} Flowsbit. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Form (Visible everywhere) */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-start p-8 sm:p-12 md:p-14 relative gap-8">
                {/* Right Top Header with Back to Home button and Logo */}
                <div className="flex items-center justify-between w-full shrink-0">
                    <Link to="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 transition-all uppercase tracking-wider group">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Home
                    </Link>
                    <Logo size="md" />
                </div>

                {/* Form Centered */}
                <div className="flex-1 flex flex-col justify-center my-auto max-w-md w-full mx-auto space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white">Create your account</h2>
                        <p className="text-slate-400 mt-2 text-sm">
                            Sign up to start designing pipelines visually.
                        </p>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl backdrop-blur-xl shadow-xl">
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-red-400 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                    Full Name
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <User className="h-4.5 w-4.5" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                    Email Address
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <Mail className="h-4.5 w-4.5" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                    Password
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <Lock className="h-4.5 w-4.5" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-11 py-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4.5 w-4.5" />
                                        ) : (
                                            <Eye className="h-4.5 w-4.5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" variant="gradient" className="w-full justify-center py-3 text-sm font-semibold rounded-xl" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                            </Button>
                        </form>
                    </div>

                    <p className="text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
