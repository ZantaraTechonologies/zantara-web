import { Lock, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotAuthenticated() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
            <div className="text-center space-y-12 animate-in fade-in slide-in-from-top-8 duration-700 max-w-lg w-full">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-emerald-200 blur-3xl opacity-30 rounded-full scale-150 animate-pulse" />
                    <div className="relative bg-white rounded-full p-10 shadow-2xl shadow-emerald-100 border border-slate-50">
                        <Lock className="w-16 h-16 text-emerald-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Restricted</h1>
                    <p className="text-slate-500 font-medium leading-relaxed px-4">
                        NOC Security Protocols: Your current session is unauthorized. Please verify your credentials to access this node.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4 flex-col sm:flex-row px-4">
                    <Link
                        to="/login"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-slate-950 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-2xl shadow-slate-200 active:scale-95"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>Authorize</span>
                    </Link>
                    <Link
                        to="/register"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-slate-900 border border-slate-100 px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Enlist</span>
                    </Link>
                </div>

                <div className="pt-8">
                    <Link to="/" className="text-[10px] font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-[0.3em]">
                        ← Return to Terminal
                    </Link>
                </div>
            </div>
        </div>
    );
}
