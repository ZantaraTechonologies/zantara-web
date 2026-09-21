import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';
import { getPostLoginPath } from '../../utils/sessionRouteState';
import { useSiteSettings } from '../../app/SiteSettingsContext';
import SiteLogo from '../../components/common/SiteLogo';

const UserLoginPage: React.FC = () => {
    const { settings } = useSiteSettings();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { login } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const from = getPostLoginPath(location.state as any);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.info(`[Auth] Attempting login for: ${email}`);
        setIsLoading(true);
        setErrorMsg('');
        try {
            await login({ email, password }, rememberMe);
            console.info(`[Auth] Login successful for: ${email}`);
            toast.success(`Welcome back to ${settings.SITE_NAME}!`);
            navigate(from, { replace: true });
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Invalid email or password';
            console.error('[Auth] Login failed');
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-brand-mint/50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            {/* Logo */}
            <div className="mb-6 flex items-center gap-3">
                <SiteLogo src={settings.SITE_LOGO} siteName={settings.SITE_NAME} className="w-9 h-9 rounded-xl shadow-btn-navy object-contain" />
                <span className="text-xl font-black text-brand-navy tracking-tight uppercase">{settings.SITE_NAME}</span>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-surface rounded-3xl shadow-card p-6 sm:p-8 border border-slate-100">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-brand-navy mb-1">Welcome back</h2>
                    <p className="text-slate-500 font-medium text-sm">Sign in to continue to your {settings.SITE_NAME} account</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 text-sm font-semibold text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                        <span className="mt-0.5 animate-pulse">⚠️</span>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">Email or Phone Number</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-emerald transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errorMsg) setErrorMsg('');
                                }}
                                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50 transition-all font-medium"
                                placeholder="08123456789 or alex@zantara.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700 block">Password</label>
                            <Link to="/forgot-password" title="Forgot Password" className="text-sm font-bold text-brand-emerald hover:text-brand-emerald-600 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-emerald transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errorMsg) setErrorMsg('');
                                }}
                                className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald/50 transition-all font-medium"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-brand-emerald border-slate-200 rounded focus:ring-brand-emerald/20"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600">
                            Keep me logged in for 30 days
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-emerald hover:bg-brand-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-btn active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-slate-500 font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" title="Create Account" className="text-brand-emerald font-bold hover:text-brand-emerald-600 transition-colors">
                            Create an account
                        </Link>
                    </p>
                </form>
            </div>

            {/* Footer Links */}
            <div className="mt-8 flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Link to="/help" className="hover:text-brand-navy transition-colors">Help</Link>
                <Link to="/privacy" className="hover:text-brand-navy transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-brand-navy transition-colors">Terms</Link>
                <Link to="/status" className="hover:text-brand-navy transition-colors">Status</Link>
            </div>
            <p className="mt-3 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                © {new Date().getFullYear()} {settings.SITE_NAME}. All rights reserved.
            </p>
        </div>
    );
};

export default UserLoginPage;
