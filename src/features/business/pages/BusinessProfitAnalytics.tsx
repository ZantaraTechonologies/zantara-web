import React, { useEffect } from 'react';
import { 
    LineChart, 
    BarChart, 
    PieChart, 
    Activity, 
    TrendingUp, 
    ArrowUpRight,
    ArrowDownRight,
    RefreshCcw,
    Zap,
    Target
} from 'lucide-react';
import { useBusinessStore } from '../store/businessStore';
import { CardSkeleton } from '../../../components/feedback/Skeletons';

const BusinessProfitAnalytics: React.FC = () => {
    const { summary, loading, fetchSummary } = useBusinessStore();

    useEffect(() => {
        fetchSummary();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(val);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Profit Analytics</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Deep dive into yield, margins & node performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                         onClick={fetchSummary}
                         className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"
                    >
                         <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                        <button className="px-5 py-2 bg-emerald-500 rounded-xl text-[10px] font-bold text-slate-950 uppercase tracking-widest shadow-lg shadow-emerald-500/10">Cycle</button>
                        <button className="px-5 py-2 text-slate-500 hover:text-slate-300 font-bold text-[10px] uppercase tracking-widest transition-all">Quarter</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4 group">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 uppercase tracking-widest">+2.4%</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aggregate Margin</p>
                        <h3 className="text-3xl font-bold text-white tracking-tighter">14.8%</h3>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4 group">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <Target size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Yield Node</p>
                        <h3 className="text-3xl font-bold text-white tracking-tighter italic">MTN DATA</h3>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4 group">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl border border-purple-500/20 group-hover:scale-110 transition-transform">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency index</p>
                        <h3 className="text-3xl font-bold text-white tracking-tighter">0.94</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32"></div>
                    <div className="relative z-10 flex items-center justify-between">
                         <h3 className="text-lg font-bold text-white">Profit Trajectory</h3>
                         <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-500"><LineChart size={16} /></div>
                    </div>
                    <div className="h-[280px] flex items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                        <div className="text-center opacity-30 group cursor-default">
                            <Zap className="w-12 h-12 text-slate-500 mx-auto mb-4 group-hover:text-emerald-500 transition-colors" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Quantum Data Rendering...</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32"></div>
                    <div className="relative z-10 flex items-center justify-between">
                         <h3 className="text-lg font-bold text-white">Yield Contribution</h3>
                         <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-500"><PieChart size={16} /></div>
                    </div>
                    <div className="h-[280px] flex items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                        <div className="text-center opacity-30 group">
                            <Target className="w-12 h-12 text-slate-500 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Mapping Product Segments...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessProfitAnalytics;
