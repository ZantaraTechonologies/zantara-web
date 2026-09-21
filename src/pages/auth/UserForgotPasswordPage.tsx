import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    Mail, 
    ArrowLeft,
    KeyRound,
    Lock
} from 'lucide-react';
import { useSiteSettings } from '../../app/SiteSettingsContext';
import SiteLogo from '../../components/common/SiteLogo';

const UserForgotPasswordPage: React.FC = () => {
    const { settings } = useSiteSettings();
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-brand-mint/50 flex flex-col font-sans">
            {/* Header */}
            <header className="w-full h-16 bg-surface border-b border-slate-100 flex items-center justify-between px-6 sm:px-12">
                <div className="flex items-center gap-3">
                    <SiteLogo src={settings.SITE_LOGO} siteName={settings.SITE_NAME} className="w-8 h-8 rounded-lg object-contain" />
                    <span className="text-xl font-black text-brand-navy tracking-tight uppercase">{settings.SITE_NAME}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline text-sm font-medium text-slate-500">Need help?</span>
                    <Link to="/login" className="bg-brand-emerald hover:bg-brand-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-btn">
                        Log In
                    </Link>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-surface rounded-3xl shadow-card p-6 sm:p-8 border border-slate-100 text-center">
                    {!isSent ? (
                        <>
                            <div className="mb-6 flex justify-center">
                                <div className="w-14 h-14 bg-brand-mint rounded-full flex items-center justify-center border border-brand-emerald/20">
                                    <KeyRound className="text-brand-emerald w-7 h-7" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-extrabold text-brand-navy mb-2">Forgot Password?</h1>
                            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
                                Enter your email address to receive a password reset link.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-bold text-slate-700 block ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-emerald transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50 transition-all font-medium"
                                            placeholder="e.g. alex@zantara.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-brand-emerald hover:bg-brand-emerald-600 text-white font-extrabold py-4 rounded-xl shadow-btn active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>

                                <div className="pt-2">
                                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-brand-emerald transition-colors group">
                                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                        <span>Back to Login</span>
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="py-6">
                            <div className="mb-6 flex justify-center">
                                <div className="w-16 h-16 bg-brand-mint rounded-full flex items-center justify-center border border-brand-emerald/20">
                                    <Mail className="text-brand-emerald w-8 h-8" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-extrabold text-brand-navy mb-3">Check your email</h2>
                            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
                                We've sent a password reset link to <span className="text-brand-navy font-bold">{email}</span>. Please check your inbox.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-brand-navy text-white font-bold py-4 rounded-xl hover:bg-brand-navy-800 transition-all active:scale-[0.98] shadow-btn-navy"
                            >
                                Return to Login
                            </button>
                            <p className="mt-8 text-slate-400 font-medium">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button onClick={() => setIsSent(false)} className="text-brand-emerald font-bold hover:underline">try again</button>
                            </p>
                        </div>
                    )}

                    <div className="pt-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest">
                        <Lock size={14} />
                        <span>Protected by {settings.SITE_NAME} Secure Shield™</span>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-5 text-center border-t border-slate-100 bg-surface">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    © {new Date().getFullYear()} {settings.SITE_NAME}. ALL RIGHTS RESERVED.
                </p>
            </footer>
        </div>
    );
};

export default UserForgotPasswordPage;
