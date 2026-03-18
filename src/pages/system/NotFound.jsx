import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
            <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-emerald-200 blur-3xl opacity-30 rounded-full scale-150 animate-pulse" />
                    <div className="relative bg-white rounded-full p-8 shadow-xl shadow-emerald-100 border border-slate-50">
                        <Search className="w-16 h-16 text-emerald-500" />
                    </div>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                    <h1 className="text-9xl font-black text-slate-100 leading-none tracking-tighter">404</h1>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Trace Failed</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        The requested resource at this endpoint is non-existent. Our scanners couldn't find anything here.
                    </p>
                </div>

                <div className="pt-6 flex items-center justify-center gap-4 flex-col sm:flex-row">
                    <Link
                        to="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-950 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-2xl shadow-slate-200 active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        <span>Back Home</span>
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-100 px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <span>Recall Last</span>
                    </button>
                </div>

                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-8">
                    Zantara VTU Service
                </p>
            </div>
        </div>
    );
}
