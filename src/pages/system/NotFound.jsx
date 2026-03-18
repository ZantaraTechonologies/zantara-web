import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
            <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-sky-200 blur-3xl opacity-30 rounded-full scale-150 animate-pulse" />
                    <div className="relative bg-white rounded-full p-8 shadow-xl shadow-sky-100 border border-slate-100">
                        <Search className="w-16 h-16 text-sky-500" />
                    </div>
                </div>

                <div className="max-w-md mx-auto space-y-3">
                    <h1 className="text-8xl font-black text-slate-200 leading-none">404</h1>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Page not found</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                <div className="pt-4 flex items-center justify-center gap-4 flex-col sm:flex-row">
                    <Link
                        to="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        <span>Go back home</span>
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <span>Previous page</span>
                    </button>
                </div>

                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-8">
                    Zantara VTU Service
                </p>
            </div>
        </div>
    );
}
