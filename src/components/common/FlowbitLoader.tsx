import React from 'react';

interface FlowbitLoaderProps {
    message?: string;
}

const FlowbitLoader: React.FC<FlowbitLoaderProps> = ({ message = "Assembling canvas..." }) => {
    return (
        <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950 z-[99999] overflow-hidden select-none">
            {/* Ambient background glow */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />
            
            {/* Subtle engineering grid background */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #818cf8 1px, transparent 1px),
                        linear-gradient(to bottom, #818cf8 1px, transparent 1px)
                    `,
                    backgroundSize: '24px 24px',
                }} 
            />

            {/* Core Diagram Animation Container */}
            <div className="relative w-60 h-40 flex items-center justify-center">
                {/* SVG Connections & Flows */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 240 160">
                    <defs>
                        <linearGradient id="gradient-ab" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
                        </linearGradient>
                        <linearGradient id="gradient-bc" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
                        </linearGradient>
                        <linearGradient id="gradient-bd" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>

                    {/* Base connection lines */}
                    <path d="M 36,80 L 120,80" stroke="url(#gradient-ab)" strokeWidth="2" fill="none" />
                    <path d="M 120,80 C 150,80 170,40 204,40" stroke="url(#gradient-bc)" strokeWidth="2" fill="none" />
                    <path d="M 120,80 C 150,80 170,120 204,120" stroke="url(#gradient-bd)" strokeWidth="2" fill="none" />

                    {/* Animated laser pulses */}
                    <path 
                        d="M 36,80 L 120,80" 
                        stroke="#818cf8" 
                        strokeWidth="2" 
                        strokeDasharray="6, 12" 
                        className="animate-[flow_2s_linear_infinite]" 
                        fill="none" 
                    />
                    <path 
                        d="M 120,80 C 150,80 170,40 204,40" 
                        stroke="#a78bfa" 
                        strokeWidth="2" 
                        strokeDasharray="6, 12" 
                        className="animate-[flow_2s_linear_infinite]" 
                        fill="none" 
                    />
                    <path 
                        d="M 120,80 C 150,80 170,120 204,120" 
                        stroke="#f472b6" 
                        strokeWidth="2" 
                        strokeDasharray="6, 12" 
                        className="animate-[flow_2s_linear_infinite]" 
                        fill="none" 
                    />
                </svg>

                {/* HTML Nodes overlay with glassmorphism */}
                
                {/* Node A (Source) */}
                <div 
                    className="absolute w-8 h-8 rounded-lg bg-slate-900/90 border border-indigo-500/20 flex items-center justify-center transition-all animate-[node-pulse-a_3s_infinite]"
                    style={{ left: '20px', top: '64px' }}
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                </div>

                {/* Node B (Decision) */}
                <div 
                    className="absolute w-8 h-8 rounded-lg bg-slate-900/90 border border-violet-500/20 flex items-center justify-center transition-all animate-[node-pulse-b_3s_infinite]"
                    style={{ left: '104px', top: '64px' }}
                >
                    <span className="w-2.5 h-2.5 bg-violet-400 rotate-45 transform rounded-sm" />
                </div>

                {/* Node C (Output 1) */}
                <div 
                    className="absolute w-8 h-8 rounded-lg bg-slate-900/90 border border-pink-500/20 flex items-center justify-center transition-all animate-[node-pulse-cd_3s_infinite]"
                    style={{ left: '188px', top: '24px' }}
                >
                    <span className="border-t-[5px] border-t-transparent border-l-[8px] border-l-pink-400 border-b-[5px] border-b-transparent ml-0.5" />
                </div>

                {/* Node D (Output 2) */}
                <div 
                    className="absolute w-8 h-8 rounded-lg bg-slate-900/90 border border-pink-500/20 flex items-center justify-center transition-all animate-[node-pulse-cd_3s_infinite]"
                    style={{ left: '188px', top: '104px' }}
                >
                    <span className="w-2.5 h-2.5 rounded-sm bg-pink-400" />
                </div>
            </div>

            {/* Custom CSS for Laser Flows & Wave Pulses */}
            <style>{`
                @keyframes flow {
                    to {
                        stroke-dashoffset: -18;
                    }
                }
                @keyframes node-pulse-a {
                    0%, 100% { 
                        transform: scale(1); 
                        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); 
                        border-color: rgba(99, 102, 241, 0.2); 
                    }
                    15%, 35% { 
                        transform: scale(1.1); 
                        box-shadow: 0 0 16px 2px rgba(99, 102, 241, 0.4); 
                        border-color: rgba(129, 140, 248, 0.8); 
                    }
                }
                @keyframes node-pulse-b {
                    0%, 35%, 100% { 
                        transform: scale(1); 
                        box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); 
                        border-color: rgba(139, 92, 246, 0.2); 
                    }
                    45%, 65% { 
                        transform: scale(1.1); 
                        box-shadow: 0 0 16px 2px rgba(139, 92, 246, 0.4); 
                        border-color: rgba(167, 139, 250, 0.8); 
                    }
                }
                @keyframes node-pulse-cd {
                    0%, 65%, 100% { 
                        transform: scale(1); 
                        box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); 
                        border-color: rgba(236, 72, 153, 0.2); 
                    }
                    75%, 95% { 
                        transform: scale(1.1); 
                        box-shadow: 0 0 16px 2px rgba(236, 72, 153, 0.4); 
                        border-color: rgba(244, 114, 182, 0.8); 
                    }
                }
            `}</style>

            {/* Typography & Brand */}
            <div className="mt-4 flex flex-col items-center gap-2">
                <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 tracking-tight">
                    Flowbit
                </span>
                <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default FlowbitLoader;
