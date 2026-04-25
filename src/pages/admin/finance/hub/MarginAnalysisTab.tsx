import React, { useEffect, useState, useCallback } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    PieChart, 
    ShieldCheck, 
    Loader2, 
    AlertCircle, 
    RefreshCcw, 
    Zap, 
    Target, 
    Activity, 
    ShoppingCart, 
    Info 
} from 'lucide-react';
import { getProfitAnalytics } from '../../../../services/admin/adminBusinessService';

interface Props {
    period: string;
    customDates: { start: string; end: string };
}

const MarginAnalysisTab: React.FC<Props> = ({ period, customDates }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {};
            const now = new Date();

            if (period === 'this-month') {
                params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            } else if (period === 'last-30-days') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(now.getDate() - 30);
                params.startDate = thirtyDaysAgo.toISOString().split('T')[0];
            } else if (period === 'custom') {
                params.startDate = customDates.start;
                params.endDate = customDates.end;
            }

            const response = await getProfitAnalytics(); // API currently doesn't take params but it should
            if (response.success) {
                setData(response.data);
                setError(null);
            } else {
                setError(response.message || 'Failed to calculate margins');
            }
        } catch (err: any) {
            setError(err.message || 'Analytics engine offline');
        } finally {
            setLoading(false);
        }
    }, [period, customDates]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading && !data) {
        return (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Calculating Margins...</p>
            </div>
        );
    }

    const { totalRevenue, totalCost, netProfit, marginPercentage, breakdown } = data || {};

    const getCategoryIcon = (id: string) => {
        switch (id) {
            case 'data': return <Zap size={18} />;
            case 'airtime': return <ShoppingCart size={18} />;
            case 'tv': case 'cable': return <PieChart size={18} />;
            default: return <Activity size={18} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <TrendingUp size={300} className="absolute top-[-40px] right-[-40px] opacity-[0.03] text-emerald-500" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="text-emerald-500" size={18} />
                            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Net Corporate Yield</p>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-10">
                            <h2 className="text-7xl font-black text-white tracking-tighter italic">₦{(netProfit || 0).toLocaleString()}</h2>
                            <div className="pb-3">
                                <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                    +{(marginPercentage || 0).toFixed(2)}% Efficiency
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
                            <div><p className="text-slate-500 font-black uppercase text-[9px] mb-2">Total Sales Revenue</p><p className="text-white font-black text-2xl">₦{(totalRevenue || 0).toLocaleString()}</p></div>
                            <div><p className="text-slate-500 font-black uppercase text-[9px] mb-2">Service Inventory Cost</p><p className="text-slate-300 font-black text-2xl italic">₦{(totalCost || 0).toLocaleString()}</p></div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between group">
                    <div>
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-inner group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-500">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="font-black text-white text-2xl tracking-tight italic">Margin Health</h3>
                        <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">Checking platform markups against live provider base rates.</p>
                    </div>
                    <div className="mt-8 p-6 bg-slate-950 rounded-3xl border border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Purity Index</span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase">{(marginPercentage || 0).toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden shadow-inner p-0.5">
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.4)]" style={{ width: `${Math.min(marginPercentage || 0, 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                    <PieChart size={18} className="text-slate-600" />
                    <h3 className="font-black text-white tracking-widest uppercase text-[10px]">Categorical Profit Breakdown</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {breakdown?.map((item: any, idx: number) => (
                        <div key={idx} className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 group hover:border-emerald-500/20 transition-all relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-400">{getCategoryIcon(item._id)}</div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-white tracking-tighter italic">₦{item.profit?.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{item.count} Txns</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1"><p className="text-[10px] font-black text-slate-400 uppercase">{item._id} Performance</p><span className="text-[10px] font-black text-emerald-500">{((item.profit / (netProfit || 1)) * 100).toFixed(0)}%</span></div>
                                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(item.profit / (netProfit || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarginAnalysisTab;
