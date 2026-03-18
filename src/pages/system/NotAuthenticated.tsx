import { Lock, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotAuthenticated() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-top-8 duration-500 max-w-lg w-full">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-sky-200 blur-3xl opacity-30 rounded-full scale-150 animate-pulse" />
                    <div className="relative bg-white rounded-full p-8 shadow-xl shadow-sky-100 border border-slate-100">
                        <Lock className="w-16 h-16 text-sky-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Login Required</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        The page you’re trying to access is protected. Please sign in to your account or create a new one to continue.
                    </p>
                </div>

                <div className="pt-4 flex items-center justify-center gap-4 flex-col sm:flex-row">
                    <Link
                        to="/login"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 active:scale-95"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                    </Link>
                    <Link
                        to="/register"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Create Account</span>
                    </Link>
                </div>

                <div className="pt-8">
                    <Link to="/" className="text-sm font-bold text-slate-400 hover:text-sky-600 transition-colors uppercase tracking-widest">
                        ← Back to Landing Page
                    </Link>
                </div>
            </div>
        </div>
    );
}
