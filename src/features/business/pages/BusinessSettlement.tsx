import React, { useEffect } from 'react';
import { 
    CheckCircle, 
    Clock, 
    ExternalLink, 
    HelpCircle, 
    RefreshCcw,
    ShieldCheck,
    AlertCircle,
    FileText
} from 'lucide-react';
import { useBusinessStore } from '../store/businessStore';
import { ListSkeleton } from '../../../components/feedback/Skeletons';

const BusinessSettlement: React.FC = () => {
    const { settlements, summary, loading, fetchSettlements } = useBusinessStore();

    useEffect(() => {
        fetchSettlements();
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
                    <h1 className="text-2xl font-bold text-white tracking-tight">Provider Settlements</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Reconcile payments with upstream nodes</p>
                </div>
                <button 
                    onClick={fetchSettlements}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    Sync Ledger
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-emerald-500/20 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={48} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Reserved Payouts</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{formatCurrency(summary.reservedPayouts || 0)}</h3>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 w-fit px-3 py-1.5 rounded-full uppercase tracking-widest">
                            <Clock size={12} />
                            Platform Liquidity
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Reconciliation Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Provider</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Transaction Ref</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Cost Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Profit</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Meta</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={6} className="p-0"><ListSkeleton count={1} /></td></tr>
                                ))
                            ) : settlements.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                                        No pending settlement records
                                    </td>
                                </tr>
                            ) : (
                                (settlements || []).map((s: any) => (
                                    <tr key={s._id} className="hover:bg-white/5 transition-colors group text-[13px]">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                <span className="font-bold text-white uppercase tracking-widest text-[11px]">{s.provider || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">{s.transactionId || '---'}</td>
                                        <td className="px-6 py-5 font-bold text-slate-300">{formatCurrency(s.costPrice)}</td>
                                        <td className="px-6 py-5 font-bold text-emerald-500">{formatCurrency(s.profit)}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/10 w-fit">
                                                <CheckCircle size={12} />
                                                {s.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-slate-500 hover:text-emerald-500 transition-colors">
                                                <ExternalLink size={16} />
                                            </button>
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

export default BusinessSettlement;
