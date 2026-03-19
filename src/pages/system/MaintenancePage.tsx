import React from 'react';
import { Settings, Clock, ShieldCheck } from 'lucide-react';

const MaintenancePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center animate-in fade-in duration-700">
            <div className="max-w-md w-full space-y-8">
                <div className="relative">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto relative z-10 border border-emerald-100/50 shadow-sm">
                        <Settings size={48} className="text-emerald-500 animate-[spin_4s_linear_infinite]" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Upgrade</h1>
                    <p className="text-slate-500 font-medium leading-relaxed px-4">
                        We're currently refining Zantara to provide you with a more seamless experience. We'll be back online shortly.
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                            <Clock size={20} className="text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Duration</p>
                            <p className="text-sm font-bold text-slate-700">Usually less than 30 minutes</p>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-50 flex items-center gap-3 text-emerald-600/60 justify-center">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Zantara Secure Protocol Active</span>
                    </div>
                </div>

                <p className="text-[11px] text-slate-400 font-medium">
                    Your funds and data remain securely protected by our end-to-end encryption.
                </p>
            </div>
        </div>
    );
};

export default MaintenancePage;
