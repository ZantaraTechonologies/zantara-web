import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    Terminal, 
    ShieldAlert, 
    Lock,
    Cpu,
    Fingerprint,
    ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';

const AdminLoginPage: React.FC = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        accessKey: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (errorMsg) setErrorMsg(''); // clear error on new input
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        try {
            // Mapping for admin login - backend might expect different fields but using authStore login
            await login({ 
                email: credentials.username, // Using username as email for simulation
                password: credentials.password,
                isAdmin: true 
            });
            toast.success('System override successful. Access granted.');
            navigate('/admin');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Invalid credentials. Access denied.';
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-['JetBrains_Mono',_monospace]">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `linear-gradient(#34d399 1px, transparent 1px), linear-gradient(90deg, #34d399 1px, transparent 1px)`,
                backgroundSize: '30px 30px'
            }}></div>
            
            <div className="w-full max-w-lg relative group">
                {/* Neon Glow Effect */}
                <div className="absolute -inset-1 bg-emerald-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                
                {/* Main Terminal Card */}
                <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Header Bar */}
                    <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Terminal className="text-emerald-400 w-5 h-5" />
                            <span className="text-emerald-400 font-bold text-xs tracking-widest uppercase">Institutional Terminal v2.4</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-10">
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 shadow-inner group-hover:border-emerald-500/50 transition-colors p-3">
                                <img src="/app_store_icon.png" alt="Zantara Logo" className="w-full h-full object-contain filter brightness-110" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">Zantara Control</h1>
                            <div className="flex items-center gap-2 text-emerald-400/60 text-[10px] font-bold tracking-[0.3em] uppercase">
                                <ShieldAlert size={12} />
                                <span>Encrypted Session Enabled</span>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {errorMsg && (
                                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                    <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0" />
                                    <p className="text-red-400 text-xs font-bold uppercase tracking-wide leading-relaxed">{errorMsg}</p>
                                </div>
                            )}
                            <div className="space-y-4">
                                {/* Username Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operator ID</label>
                                        <span className="text-[10px] text-emerald-500/40">ROOT REQUIRED</span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                            <Fingerprint size={16} />
                                        </div>
                                        <input
                                            name="username"
                                            type="text"
                                            required
                                            value={credentials.username}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 placeholder:text-slate-800 focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm"
                                            placeholder="ADMIN_10294"
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cipher Token</label>
                                        <Lock size={12} className="text-slate-700" />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        value={credentials.password}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 placeholder:text-slate-800 focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm"
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                                        Decrypting...
                                    </span>
                                ) : (
                                    <>
                                        <span>Initialize Override</span>
                                        <ArrowRight size={14} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-4">
                                System Status: <span className="text-emerald-500 animate-pulse">Online</span>
                            </p>
                            <Link to="/login" className="text-[10px] text-slate-500 hover:text-emerald-400 transition-colors uppercase font-bold tracking-widest">
                                Return to public portal
                            </Link>
                        </div>
                    </div>
                </div>

                {/* System Footnote */}
                <div className="mt-6 flex justify-between items-center text-[9px] text-slate-700 font-bold uppercase tracking-widest px-4">
                    <span>Node: HK-CLUSTER-04</span>
                    <span>Lat: 2.4ms</span>
                    <span>© Zantara SecOps</span>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
