import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/api/auth-service';
import { useAuthStore } from '../../store/auth-store';
import { useWorkspaceStore } from '../../store/workspace-store';
import { FlowbitLogo } from '../../components/icons/Logo';
import { Button } from '../../components/common/Button';
import { Loader2, ArrowLeft, LogOut, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user, logout, updateUser, isAuthenticated } = useAuthStore();
    const { spaces, flows } = useWorkspaceStore();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!user && isAuthenticated);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const profile = await AuthService.getCurrentProfile();
                updateUser(profile);
                setName(profile.name);
                setEmail(profile.email);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoading) {
            fetchProfile();
        }
    }, [isLoading, updateUser, isAuthenticated]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setIsSaving(true);
        try {
            const updatedProfile = await AuthService.updateProfile(name);
            updateUser(updatedProfile);
            setMessage({ text: 'Profile updated successfully', type: 'success' });
        } catch (err: any) {
            setMessage({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
                <header className="h-20 px-10 flex items-center border-b border-slate-800/50 justify-between bg-slate-900/40">
                    <div className="flex items-center gap-4">
                        <Link to="/space" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-400 hover:text-white" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <FlowbitLogo className="w-6 h-6" />
                            <span className="text-xl font-bold tracking-tight">Settings</span>
                        </div>
                    </div>
                    <Button variant="primary" onClick={() => navigate('/login')} className="flex items-center gap-2">
                        Sign In / Sign Up
                    </Button>
                </header>

                <main className="max-w-3xl mx-auto py-10 px-6">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl shadow-black/20">
                        <div className="px-8 py-6 border-b border-slate-800/50 bg-slate-900/80 flex items-center gap-3">
                            <Sparkles size={20} className="text-indigo-400 animate-pulse" />
                            <div>
                                <h2 className="text-xl font-semibold">Guest Session Profile</h2>
                                <p className="text-sm text-slate-400 mt-1">You are currently using Flowbit locally</p>
                            </div>
                        </div>

                        <div className="px-8 py-8 space-y-8">
                            {/* Limits progress */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Local Workspace Usage</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800">
                                        <div className="flex justify-between text-sm mb-2 font-medium">
                                            <span className="text-slate-300">Spaces Created</span>
                                            <span className="text-slate-200">{spaces.length} / 3</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-indigo-500 h-full transition-all duration-500" 
                                                style={{ width: `${Math.min((spaces.length / 3) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800">
                                        <div className="flex justify-between text-sm mb-2 font-medium">
                                            <span className="text-slate-300">Flows Created</span>
                                            <span className="text-slate-200">{flows.length} / 6</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-purple-500 h-full transition-all duration-500" 
                                                style={{ width: `${Math.min((flows.length / 6) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Call to action card */}
                            <div className="bg-gradient-to-tr from-indigo-950/40 via-slate-900 to-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
                                    <div className="space-y-2 text-center md:text-left">
                                        <h4 className="text-lg font-semibold text-white">Save your work to the Cloud</h4>
                                        <p className="text-sm text-slate-400 max-w-md">
                                            Creating a free account syncs your local spaces, flowcharts, and canvases automatically to our cloud servers so you never lose your progress.
                                        </p>
                                        <ul className="text-xs text-slate-300 space-y-1.5 mt-4 text-left inline-block">
                                            <li className="flex items-center gap-2">
                                                <Check size={14} className="text-indigo-400" />
                                                <span>Unlimited Spaces & flows</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check size={14} className="text-indigo-400" />
                                                <span>Collaborate with others in real-time</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check size={14} className="text-indigo-400" />
                                                <span>Access from any device anywhere</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="py-3 px-5 whitespace-nowrap bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10 active:scale-[0.98]"
                                    >
                                        <span>Get Started Free</span>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
            <header className="h-20 px-10 flex items-center border-b border-slate-800/50 justify-between bg-slate-900/40">
                <div className="flex items-center gap-4">
                    <Link to="/space" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-400 hover:text-white" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <FlowbitLogo className="w-6 h-6" />
                        <span className="text-xl font-bold tracking-tight">Settings</span>
                    </div>
                </div>
                <Button variant="danger" onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </header>

            <main className="max-w-3xl mx-auto py-10 px-6">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl shadow-black/20">
                    <div className="px-8 py-6 border-b border-slate-800/50 bg-slate-900/80">
                        <h2 className="text-xl font-semibold">User Profile</h2>
                        <p className="text-sm text-slate-400 mt-1">Update your personal information</p>
                    </div>

                    <div className="px-8 py-6">
                        {message.text && (
                            <div className={`mb-6 p-4 rounded-lg font-medium text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        type="email"
                                        disabled
                                        value={email}
                                        className="appearance-none block w-full px-4 py-3 border border-slate-800 rounded-lg shadow-sm sm:text-sm bg-slate-950/50 text-slate-500 cursor-not-allowed"
                                    />
                                    <p className="mt-2 text-xs text-slate-500">Your email address cannot be changed.</p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                                    Full Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="appearance-none block w-full px-4 py-3 border border-slate-700 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-950 text-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" variant="primary" disabled={isSaving || !name.trim()}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
