import React, { useEffect } from 'react';
import { 
    ArrowDownLeft, 
    ArrowUpRight, 
    TrendingUp, 
    Filter, 
    Calendar,
    RefreshCcw,
    Activity,
    CreditCard,
    DollarSign,
    ArrowRightLeft
} from 'lucide-react';
import { useBusinessStore } from '../store/businessStore';
import { CardSkeleton, ListSkeleton } from '../../../components/feedback/Skeletons';

const BusinessCashFlow: React.FC = () => {
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Financial Pulse</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Monitor real-time system-wide liquidity flow</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchSummary}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"
                    >
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all">
                        <Calendar size={14} />
                        Cycle Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-emerald-500/10">
                        <ArrowDownLeft size={48} />
                    </div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Gross Inflow</p>
                    <h3 className="text-3xl font-bold text-white tracking-tighter">{formatCurrency(summary.totalRevenue || 0)}</h3>
                </div>
                
                <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-red-500/10">
                        <ArrowUpRight size={48} />
                    </div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Total Outflow</p>
                    <h3 className="text-3xl font-bold text-white tracking-tighter">{formatCurrency(summary.totalCost || 0)}</h3>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-8 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-blue-500/10">
                        <TrendingUp size={48} />
                    </div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Net Position</p>
                    <h3 className="text-3xl font-bold text-white tracking-tighter">{formatCurrency(summary.netProfit || 0)}</h3>
                </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Flow Activity</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Transaction Trace</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Vector</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Amplitude</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Sync Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={4} className="p-0"><ListSkeleton count={1} /></td></tr>
                                ))
                            ) : (summary.recentActivities || []).length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                                        No recent flow activity detected
                                    </td>
                                </tr>
                            ) : (
                                (summary.recentActivities || []).map((tx: any) => (
                                    <tr key={tx._id} className="hover:bg-white/5 transition-colors group text-[13px]">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 group-hover:text-white transition-colors">
                                                    <ArrowRightLeft size={16} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-slate-200 capitalize">{tx.type} {tx.service}</p>
                                                    <p className="text-[10px] font-mono text-slate-600 uppercase">{tx.transactionId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                tx.status === 'success' 
                                                ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' 
                                                : 'bg-red-500/5 text-red-500 border-red-500/10'
                                            }`}>
                                                {tx.status === 'success' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                                {tx.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-white">{formatCurrency(tx.amount)}</td>
                                        <td className="px-6 py-5 text-right text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                            {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString() : 'Recent'}
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

export default BusinessCashFlow;
