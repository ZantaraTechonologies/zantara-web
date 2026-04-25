import React from 'react';
import { 
    Zap, 
    Download, 
    RefreshCcw,
    Activity,
    Cpu
} from 'lucide-react';

interface CatalogMaintenanceToolsProps {
    onSync: () => void;
    onImport: (category: string) => void;
    isProcessing: boolean;
}

const CatalogMaintenanceTools: React.FC<CatalogMaintenanceToolsProps> = ({ onSync, onImport, isProcessing }) => {
    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Zap size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Maintenance & Sync Tools</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bulk Operations & Vendor Synchronization</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                    onClick={onSync}
                    disabled={isProcessing}
                    className="flex items-center justify-between p-6 bg-slate-950 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group disabled:opacity-50"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                            <RefreshCcw size={18} className={isProcessing ? 'animate-spin' : ''} />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black text-white uppercase tracking-tighter">Sync Provider Costs</p>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Update all base prices</p>
                        </div>
                    </div>
                    <Activity size={16} className="text-slate-800 group-hover:text-indigo-500/30 transition-colors" />
                </button>

                <div className="relative group">
                    <button 
                        onClick={() => onImport('all')}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-between p-6 bg-slate-950 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all disabled:opacity-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-colors">
                                <Download size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black text-white uppercase tracking-tighter">Import Full Catalog</p>
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Auto-onboard from VTPass</p>
                            </div>
                        </div>
                        <Cpu size={16} className="text-slate-800 group-hover:text-emerald-500/30 transition-colors" />
                    </button>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Global Sync Status: Operational</span>
            </div>
        </div>
    );
};

export default CatalogMaintenanceTools;
