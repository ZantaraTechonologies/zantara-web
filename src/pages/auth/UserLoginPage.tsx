import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ChevronRight,
    Github
} from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';

const UserLoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { login } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || '/app/wallet';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login({ email, password });
            toast.success('Welcome back to Zantara!');
            navigate(from, { replace: true });
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Invalid email or password';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-slate-950 relative flex-col justify-between p-16 overflow-hidden">
                {/* Background Pattern/Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 opacity-90"></div>

                {/* Simulated Network Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, #34d399 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <img src="/app_store_icon.png" alt="Zantara Logo" className="w-10 h-10 rounded-xl shadow-lg" />
                        <span className="text-2xl font-bold text-white tracking-tight">Zantara</span>
                    </div>

                    <h1 className="text-4xl font-bold text-white leading-tight mb-6 max-w-md">
                        Secure your future with next-gen fintech.
                    </h1>
                    <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                        Experience a seamless way to manage your assets, investments, and global transactions with enterprise-grade security.
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-xs font-medium">
                                    <span className="opacity-0">U</span>
                                    <img
                                        src={`https://i.pravatar.cc/100?u=${i}`}
                                        alt="User"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-slate-300 text-sm font-medium">
                            Joined by <span className="text-emerald-400 font-bold">50,000+</span> investors globally
                        </p>
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-medium tracking-wider uppercase">
                        <span>© 2026 ZANTARA INC.</span>
                        <Link to="/privacy-policy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
                <div className="w-full max-w-md">
                    <div className="mb-8 lg:hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <img src="/app_store_icon.png" alt="Zantara Logo" className="w-8 h-8 rounded-lg" />
                            <span className="text-xl font-bold text-slate-900 tracking-tight">Zantara</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                        <p className="text-slate-500 font-medium">Enter your credentials to access your Zantara account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">Email or Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
                                    placeholder="e.g. alex@zantara.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700 block">Password</label>
                                <Link to="/forgot-password" title="Forgot Password" className="text-sm font-bold text-emerald-500 hover:text-emerald-600 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
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
                                className="w-4 h-4 text-emerald-500 border-slate-200 rounded focus:ring-emerald-500/20"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600">
                                Keep me logged in for 30 days
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:active:scale-100"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-4 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-slate-400">
                                <span className="bg-white px-4">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-3 py-3 border border-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale opacity-70" />
                                <span>Google</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-3 py-3 border border-slate-100 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
                            >
                                <Github size={20} className="text-slate-900" />
                                <span>GitHub</span>
                            </button>
                        </div>

                        <p className="text-center text-slate-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" title="Create Account" className="text-emerald-500 font-bold hover:text-emerald-600 transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserLoginPage;
