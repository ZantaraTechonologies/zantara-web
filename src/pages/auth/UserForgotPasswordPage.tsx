import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    Mail, 
    ArrowLeft,
    KeyRound,
    Lock
} from 'lucide-react';

const UserForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulation of reset link 
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
            toast.success('Reset link sent to your email!');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter',_sans-serif]">
            {/* Header */}
            <header className="w-full h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sm:px-12">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-slate-900 rounded-sm"></div>
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight uppercase">Zantara</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline text-sm font-medium text-slate-500">Need help?</span>
                    <Link to="/login" className="bg-emerald-400 hover:bg-emerald-500 text-slate-950 px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/10">
                        Log In
                    </Link>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 border border-slate-100 text-center">
                    {!isSent ? (
                        <>
                            <div className="mb-8 flex justify-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <KeyRound className="text-emerald-500 w-8 h-8" />
                                </div>
                            </div>

                            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Forgot Password?</h1>
                            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
                                Enter your email address to receive a password reset link.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
                                            placeholder="e.g. alex@zantara.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-extrabold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-4 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>

                                <div className="pt-2">
                                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-500 transition-colors group">
                                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                        <span>Back to Login</span>
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="py-8">
                            <div className="mb-8 flex justify-center">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <Mail className="text-emerald-500 w-10 h-10" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Check your email</h2>
                            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto text-lg leading-relaxed">
                                We've sent a password reset link to <span className="text-slate-900 font-bold">{email}</span>. Please check your inbox.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-slate-950 text-white font-bold py-4 rounded-xl hover:bg-slate-900 transition-all active:scale-[0.98]"
                            >
                                Return to Login
                            </button>
                            <p className="mt-8 text-slate-400 font-medium">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button onClick={() => setIsSent(false)} className="text-emerald-500 font-bold hover:underline">try again</button>
                            </p>
                        </div>
                    )}

                    <div className="pt-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest">
                        <Lock size={14} />
                        <span>Protected by Zantara Secure Shield™</span>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 text-center border-t border-slate-100 bg-white">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    © 2024 ZANTARA TECHNOLOGIES. ALL RIGHTS RESERVED.
                </p>
            </footer>
        </div>
    );
};

export default UserForgotPasswordPage;
