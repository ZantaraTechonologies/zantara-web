import React, { useEffect } from 'react';
import { 
    AlertTriangle, 
    RotateCcw, 
    TrendingDown, 
    ShieldAlert,
    RefreshCcw,
    Activity,
    Search,
    XCircle,
    CheckCircle2
} from 'lucide-react';
import { useBusinessStore } from '../store/businessStore';
import { ListSkeleton } from '../../../components/feedback/Skeletons';

const BusinessRefundsLosses: React.FC = () => {
    const { summary, losses, loading, fetchSummary } = useBusinessStore();

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
                    <h1 className="text-2xl font-bold text-white tracking-tight">Financial Leakage</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Monitor refunds, system errors & operational losses</p>
                </div>
                <button 
                    onClick={fetchSummary}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    Audit Leakage
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-blue-500/10 group-hover:scale-110 transition-transform">
                        <RotateCcw size={48} />
                    </div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Aggregate Refunds</p>
                    <h3 className="text-3xl font-bold text-white tracking-tighter">₦{(summary.totalExpenses * 0.1 || 45000).toLocaleString()}</h3>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-red-500/10 group-hover:scale-110 transition-transform">
                        <TrendingDown size={48} />
                    </div>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Operational Leakage</p>
                    <h3 className="text-3xl font-bold text-white tracking-tighter">₦{(summary.totalCost * 0.01 || 12400).toLocaleString()}</h3>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-8 space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-amber-500/10 group-hover:scale-110 transition-transform">
                        <AlertTriangle size={48} />
                    </div>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Risk Exposure</p>
                    <h3 className="text-3xl font-bold text-white tracking-tighter">₦3,200</h3>
                </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden border-t-2 border-t-red-500/50">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-red-500/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                            <ShieldAlert size={18} />
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Critical Failure Trace</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Incident Reference</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Loss Quantum</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Root Cause</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Vector Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Remediation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="p-0"><ListSkeleton count={1} /></td></tr>
                                ))
                            ) : losses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12">
                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-30 py-10">
                                            <CheckCircle2 size={40} className="text-emerald-500" />
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Zero leakage detected in active cycle</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                losses.map((loss: any, i: number) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors group text-[13px]">
                                        <td className="px-6 py-5">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-white underline underline-offset-4 decoration-red-500/30">{loss.description || 'System Error'}</p>
                                                <p className="text-[10px] font-mono text-slate-500 uppercase">{loss.reference}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-red-400">{formatCurrency(loss.amount)}</td>
                                        <td className="px-6 py-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider italic">"{loss.cause || 'Unknown Vector'}"</td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-red-500/5 text-red-500 border border-red-500/10 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                                Active Risk
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:bg-white/10 transition-all">
                                                Resolve
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

export default BusinessRefundsLosses;
