import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Check, Lock } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    limitType: 'space' | 'flow';
}

export default function UpgradeModal({ isOpen, onClose, limitType }: UpgradeModalProps) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        onClose();
        navigate('/login');
    };

    const limitTitle = limitType === 'space' ? '3 Space Limit Reached' : '6 Flow Limit Reached';
    const limitDesc = limitType === 'space' 
        ? "Guest sessions are limited to 3 Spaces to manage local device memory." 
        : "Guest sessions are limited to 6 Flows globally across all Spaces.";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl max-w-md w-full overflow-hidden relative animate-scale-up">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1.5 hover:bg-slate-800 rounded-lg"
                >
                    <X size={18} />
                </button>

                <div className="p-8">
                    {/* Glowing Sparkle Icon Header */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-md animate-pulse"></div>
                            <div className="relative bg-gradient-to-tr from-indigo-500 to-purple-500 p-4 rounded-full border border-indigo-400/30 text-white animate-bounce-subtle">
                                <Sparkles size={28} />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-3">
                            {limitTitle}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed px-2">
                            {limitDesc}
                        </p>
                    </div>

                    {/* Features Comparison */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 mb-8 space-y-4">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Compare Plans
                        </div>
                        
                        <div className="flex items-start gap-3">
                            <div className="text-red-400/80 mt-0.5"><Lock size={15} /></div>
                            <div className="text-xs text-slate-400 leading-tight">
                                <span className="font-medium text-slate-300">Guest:</span> max 3 Spaces & 6 Flows, local browser storage only (can be lost if cache cleared).
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="text-emerald-400 mt-0.5"><Check size={16} /></div>
                            <div className="text-xs text-slate-300 leading-tight">
                                <span className="font-semibold text-white">Free Account:</span> Unlimited Spaces, Unlimited Flows, Cloud Sync, and secure remote backup.
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleUpgrade}
                            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                        >
                            Sign In / Sign Up to Upgrade
                        </button>
                        
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-sm font-medium rounded-xl transition-all duration-200"
                        >
                            Continue Working with Existing flows
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
