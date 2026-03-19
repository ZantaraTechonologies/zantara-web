import React from 'react';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';

const ErrorPage: React.FC = () => {
    const { resetSystemStates } = useAuthStore();

    const handleReset = () => {
        resetSystemStates();
        window.location.href = '/app';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto border border-amber-100">
                    <AlertTriangle size={32} className="text-amber-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Something Went Wrong</h1>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed italic">
                        "An unexpected processing anomaly occurred. Our engineers have been notified."
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-slate-950 text-white py-4 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={18} />
                        Restart Application
                    </button>
                    
                    <button 
                        onClick={handleReset}
                        className="w-full bg-white text-slate-500 py-4 rounded-2xl font-bold text-sm hover:text-slate-900 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-slate-100"
                    >
                        <Home size={18} />
                        Return Dashboard
                    </button>
                </div>

                <div className="pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Kernel Error Trace-ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
