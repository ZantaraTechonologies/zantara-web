import React, { useEffect } from 'react';
import { 
    LayoutDashboard, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    CreditCard, 
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    PieChart,
    ArrowRight
} from 'lucide-react';
import { useBusinessStore } from '../store/businessStore';
import { CardSkeleton, ListSkeleton } from '../../../components/feedback/Skeletons';

const BusinessOverview: React.FC = () => {
    const { summary, loading, fetchSummary } = useBusinessStore();

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(val);
    };

    if (loading && !summary.totalRevenue) {
        return (
            <div className="space-y-8">
                <div className="h-12 w-48 bg-white/5 animate-pulse rounded-xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-80 bg-white/5 animate-pulse rounded-3xl"></div>
                    <div className="h-80 bg-white/5 animate-pulse rounded-3xl"></div>
                </div>
            </div>
        );
    }

    const cards = [
        { title: 'Total Revenue', value: summary.totalRevenue, icon: TrendingUp, color: 'text-emerald-500', trend: '+12.5%', isPos: true },
        { title: 'System Cost', value: summary.totalCost, icon: CreditCard, color: 'text-blue-500', trend: '+8.2%', isPos: true },
        { title: 'Gross Profit', value: summary.totalProfit, icon: DollarSign, color: 'text-emerald-400', trend: '+14.1%', isPos: true },
        { title: 'Operational Exp', value: summary.totalExpenses, icon: TrendingDown, color: 'text-red-400', trend: '-2.4%', isPos: false },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Financial Intelligence</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Real-time profitability & performance analytics</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all">
                        Generate Report
                    </button>
                    <button className="px-5 py-2.5 bg-emerald-500 rounded-2xl text-[10px] font-bold text-slate-950 uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10">
                        Settlement Ledger
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4 hover:border-white/10 transition-all group">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${card.color} transition-transform group-hover:scale-110`}>
                                <card.icon size={20} />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold ${card.isPos ? 'text-emerald-500' : 'text-red-500'}`}>
                                {card.isPos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {card.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.title}</p>
                            <h3 className="text-2xl font-bold text-white tracking-tight mt-1">{formatCurrency(card.value)}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/5 p-8 rounded-3xl border border-white/5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl -mr-20 -mt-20 rounded-full"></div>
                    <div className="relative z-10 flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Profitability Velocity</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Performance over active interval</p>
                        </div>
                        <select className="bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Fiscal Quarter</option>
                        </select>
                    </div>
                    <div className="h-[280px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                        <Activity size={32} className="text-slate-800 mb-4" />
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Matrix analytics loading...</p>
                    </div>
                </div>

                <div className="bg-white/5 p-8 rounded-3xl border border-white/5 shadow-sm space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Capital Margin</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Net efficiency ratio</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative w-44 h-44">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle className="text-white/5 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                                <circle 
                                    className="text-emerald-500 stroke-current drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                                    strokeWidth="8" 
                                    strokeLinecap="round" 
                                    fill="transparent" 
                                    r="40" 
                                    cx="50" 
                                    cy="50" 
                                    strokeDasharray={`${(summary.netProfit / (summary.totalRevenue || 1)) * 251.2}, 251.2`}
                                    transform="rotate(-90 50 50)" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-white tracking-tighter">
                                    {summary.totalRevenue ? Math.round((summary.netProfit / summary.totalRevenue) * 100) : 0}%
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Efficiency</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-slate-500">Gross Intake</span>
                            <span className="text-white">{formatCurrency(summary.totalRevenue)}</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest pt-2">
                            <span className="text-slate-500">Net Retained</span>
                            <span className="text-emerald-500">{formatCurrency(summary.netProfit)}</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500/40" style={{ width: `${(summary.netProfit / (summary.totalRevenue || 1)) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white/5 rounded-3xl border border-white/5 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Settlement History</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Recent high-value flow</p>
                    </div>
                    <button className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1.5 group">
                        Full Ledger
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Transaction Trace</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Node/Channel</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Cost Basis</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Delta Profit</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(summary.recentActivities || []).length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">No financial data detected in current node</td>
                                </tr>
                            ) : (
                                summary.recentActivities.map((tx: any, i: number) => (
                                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-white">{tx.description}</p>
                                                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{tx.id}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{tx.channel}</span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-400">{formatCurrency(tx.cost)}</td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-bold text-emerald-500">+{formatCurrency(tx.profit)}</p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase">Margin: {Math.round((tx.profit / tx.revenue) * 100)}%</p>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                Verified
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BusinessOverview;
