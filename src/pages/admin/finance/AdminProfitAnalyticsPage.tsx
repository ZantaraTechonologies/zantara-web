import React, { useEffect, useState, useCallback } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Download, 
    PieChart, 
    ShieldCheck, 
    Loader2, 
    AlertCircle, 
    ArrowRight,
    Search,
    RefreshCcw,
    Zap,
    Target,
    Activity,
    Clock,
    ShoppingCart,
    Wallet,
    Info
} from 'lucide-react';
import { getProfitAnalytics } from '../../../services/admin/adminBusinessService';
import { toast } from 'react-hot-toast';

const AdminProfitAnalyticsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [period, setPeriod] = useState<'this-month' | 'last-30-days' | 'all-time' | 'custom'>('this-month');
    const [customDates, setCustomDates] = useState({ 
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
        end: new Date().toISOString().split('T')[0] 
    });

    const getDateParams = useCallback(() => {
        const now = new Date();
        let startDate: string | undefined;
        let endDate: string | undefined = now.toISOString().split('T')[0];

        switch (period) {
            case 'this-month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                break;
            case 'last-30-days':
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(now.getDate() - 30);
                startDate = thirtyDaysAgo.toISOString().split('T')[0];
                break;
            case 'all_time':
                startDate = undefined;
                endDate = undefined;
                break;
            case 'custom':
                startDate = customDates.start;
                endDate = customDates.end;
                break;
        }

        return { startDate, endDate };
    }, [period, customDates]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = getDateParams();
            const response = await getProfitAnalytics(params);
            if (response.success) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to calculate margins');
            }
        } catch (err: any) {
            setError(err.message || 'Analytics engine offline');
        } finally {
            setLoading(false);
        }
    }, [getDateParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (error) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-rose-500 bg-rose-500/5 rounded-[3rem] border border-rose-500/10 m-6">
                <AlertCircle className="w-16 h-16 animate-pulse" />
                <h2 className="text-xl font-black uppercase tracking-tighter">Neural Link Severed</h2>
                <p className="font-bold uppercase tracking-[0.2em] text-[10px] text-rose-500/60 max-w-xs text-center">{error}</p>
                <button onClick={fetchData} className="mt-4 px-8 py-3 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-rose-500/20">Re-Establish Connection</button>
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
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Strategic Profit Monitoring</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black text-white tracking-tighter italic">Profit Analytics</h1>
                        <button 
                            onClick={fetchData}
                            className={`p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-500 transition-all ${loading ? 'animate-spin text-emerald-500 border-emerald-500/50' : ''}`}
                            title="Recalculate Margins"
                        >
                            <RefreshCcw size={16} />
                        </button>
                    </div>
                    <p className="text-slate-500 text-xs font-medium mt-2 max-w-lg leading-relaxed">
                        Granular margin tracking across <span className="text-emerald-400">Inventory Cost</span>, <span className="text-blue-400">Commissions</span>, and <span className="text-white">Net Yield</span> layers.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-4 bg-slate-900 border border-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-white/10 transition-all flex items-center gap-2 active:scale-95">
                        <Download size={16} /> Export Deep-Report
                    </button>
                </div>
            </div>

            {/* Slicer Bar */}
            <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl flex flex-col xl:flex-row items-center gap-6 shadow-2xl">
                <div className="flex bg-slate-950 p-1 rounded-2xl self-stretch xl:self-auto overflow-x-auto no-scrollbar shrink-0">
                    <div className="flex items-center px-4 border-r border-white/5 mr-1">
                        <Clock size={14} className="text-slate-600" />
                    </div>
                    {(['this-month', 'last-30-days', 'all-time', 'custom'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setPeriod(r)}
                            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                period === r ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-white"
                            }`}
                        >
                            {r.replace(/-/g, ' ')}
                        </button>
                    ))}
                </div>

                {period === 'custom' && (
                    <div className="flex flex-col md:flex-row items-center gap-4 flex-1 animate-in slide-in-from-left-2 duration-300">
                        <div className="relative w-full md:w-44">
                            <input 
                                type="date" 
                                className="w-full h-12 bg-slate-950 border border-white/5 rounded-xl px-4 text-white text-[10px] font-black uppercase outline-none focus:border-emerald-500/50 transition-all color-scheme-dark"
                                value={customDates.start}
                                onChange={(e) => setCustomDates({...customDates, start: e.target.value})}
                            />
                        </div>
                        <ArrowRight size={14} className="text-slate-700 hidden md:block" />
                        <div className="relative w-full md:w-44">
                            <input 
                                type="date" 
                                className="w-full h-12 bg-slate-950 border border-white/5 rounded-xl px-4 text-white text-[10px] font-black uppercase outline-none focus:border-emerald-500/50 transition-all color-scheme-dark"
                                value={customDates.end}
                                onChange={(e) => setCustomDates({...customDates, end: e.target.value})}
                            />
                        </div>
                        <button 
                            onClick={fetchData}
                            className="h-12 px-6 bg-slate-950 border border-emerald-500/30 text-emerald-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl active:scale-95"
                        >
                            Sync Range
                        </button>
                    </div>
                )}
            </div>

            {/* Neural Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-[-40px] right-[-40px] p-8 opacity-[0.03] text-emerald-500 group-hover:scale-110 transition-transform duration-1000">
                        <TrendingUp size={300} />
                    </div>
                    
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
                            <div>
                                <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Total Sales Revenue
                                </p>
                                <p className="text-white font-black text-2xl tracking-tighter">₦{(totalRevenue || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Service Inventory Cost
                                </p>
                                <p className="text-slate-300 font-black text-2xl tracking-tighter italic">₦{(totalCost || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between group">
                    <div>
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-inner group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-500">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="font-black text-white text-2xl tracking-tight italic">Margin Health</h3>
                        <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                            Strategic check of platform markups against <span className="text-slate-300">Live Provider Base Rates</span>.
                        </p>
                    </div>
                    
                    <div className="mt-8 p-6 bg-slate-950 rounded-3xl border border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Purity Index</span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{(marginPercentage || 0).toFixed(2)}% Verified</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden shadow-inner p-0.5">
                            <div 
                                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                                style={{ width: `${Math.min(marginPercentage || 0, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-[9px] text-slate-700 font-bold mt-4 uppercase tracking-tighter italic">Optimized for operational stability</p>
                    </div>
                </div>
            </div>

            {/* Categorical Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                    <PieChart size={18} className="text-slate-600" />
                    <h3 className="font-black text-white tracking-widest uppercase text-[10px]">Categorical Profit Breakdown</h3>
                </div>

                {breakdown && breakdown.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {breakdown.map((item: any, idx: number) => (
                            <div key={idx} className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 group hover:border-emerald-500/20 transition-all relative overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 transition-all group-hover:bg-white/10 group-hover:text-emerald-400`}>
                                        {getCategoryIcon(item._id)}
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 justify-end mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <p className="text-2xl font-black text-white tracking-tighter italic">₦{item.profit?.toLocaleString()}</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.count} Transactions Reconciled</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest capitalize">{item._id} Performance</p>
                                        <span className="text-[10px] font-black text-emerald-500">
                                            {((item.profit / (netProfit || 1)) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 group-hover:glow-emerald" 
                                            style={{ width: `${(item.profit / (netProfit || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Info size={14} className="text-slate-800" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-32 bg-slate-900 rounded-[3rem] border border-white/5 border-dashed text-center">
                        <Activity size={48} className="mx-auto text-slate-800 mb-6 animate-pulse" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">No categorical data detected in range</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProfitAnalyticsPage;
