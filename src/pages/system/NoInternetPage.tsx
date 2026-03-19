import React, { useState } from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';

const NoInternetPage: React.FC = () => {
    const { resetSystemStates, fetchMe } = useAuthStore();
    const [retrying, setRetrying] = useState(false);

    const handleRetry = async () => {
        setRetrying(true);
        // Clear flags and try to bootstrap
        resetSystemStates();
        try {
            await fetchMe();
        } finally {
            setRetrying(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="max-w-md w-full space-y-10">
                <div className="relative">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 shadow-sm relative z-10">
                        <WifiOff size={32} className="text-slate-300" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Connection Lost</h1>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-[280px] mx-auto text-center italic">
                             "We couldn't establish a secure pathway to our servers. Check your data or Wi-Fi."
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleRetry}
                        disabled={retrying}
                        className="w-full max-w-[200px] bg-slate-950 text-white py-4 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mx-auto"
                    >
                        <RefreshCw size={18} className={retrying ? "animate-spin" : ""} />
                        {retrying ? "Reconnecting..." : "Retry Connection"}
                    </button>
                    
                    <div className="flex items-center gap-2 justify-center text-slate-300">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Protocol 404-NET</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoInternetPage;
