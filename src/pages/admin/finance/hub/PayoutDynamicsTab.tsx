import React, { useState } from "react";
import { 
    TrendingUp, 
    ShieldCheck, 
    Briefcase, 
    Zap, 
    Users, 
    Info, 
    History, 
    Loader2, 
    Activity, 
    AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { useAdminEarnings } from "../../../../hooks/admin/useAdminAnalytics";
import { useWalletStore } from "../../../../store/wallet/walletStore";

interface Props {
    period: string;
    customDates: { start: string; end: string };
}

const PayoutDynamicsTab: React.FC<Props> = ({ period, customDates }) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const { currency } = useWalletStore();
    const [activeTab, setActiveTab] = useState<'referrers' | 'agents'>('referrers');

    const { data: analytics, isLoading, error } = useAdminEarnings({
        page,
        limit: 25,
        search,
        type,
        startDate: period === 'custom' ? customDates.start : undefined,
        endDate: period === 'custom' ? customDates.end : undefined,
        period: period !== 'custom' ? period : undefined
    });

    if (error) {
        return (
            <div className="p-12 text-center text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem]">
                <AlertCircle className="mx-auto mb-4" size={48} />
                <h2 className="text-xl font-bold">Diagnostics Offline</h2>
                <p className="text-sm opacity-70">Neural link to financial subsystem interrupted.</p>
            </div>
        );
    }

    const overview = analytics?.data?.overview;
    const performers = analytics?.data?.performers;
    const caps = analytics?.data?.caps;
    const history = analytics?.data?.history || [];
    const pagination = analytics?.data?.pagination;

    const statsCards = [
        { label: "Referral Payouts", value: overview?.totalReferralPayouts || 0, icon: Users, color: "emerald", desc: "Cumulative commissions disbursed" },
        { label: "Capped Events", value: overview?.cappedCommissionsCount || 0, icon: ShieldCheck, color: "amber", desc: "Margin-protected transactions" },
        { label: "Skipped (Low Margin)", value: overview?.skippedCommissionsCount || 0, icon: Zap, color: "slate", desc: "Zero-yield commission bypass" },
    ];

    if (isLoading && !analytics) {
        return (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Analyzing Payout Dynamics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, i) => (
                    <div key={i} className="bg-surface border border-slate-200 p-6 rounded-[2.5rem] flex flex-col space-y-4 hover:border-slate-300 transition-all group relative overflow-hidden backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.label}</p>
                            <Info size={14} className="text-slate-600" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 border ${card.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : card.color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : card.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}>
                                <card.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">
                                {card.label.includes('Payouts') || card.label.includes('Profits') ? `${currency}${(card.value).toLocaleString()}` : card.value.toLocaleString()}
                            </h3>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-70 mt-auto">{card.desc}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Top Performers */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-surface border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Yield Performers</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global conversion leaders</p>
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                                <button onClick={() => setActiveTab('referrers')} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'referrers' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500'}`}>Referrers</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                        <th className="px-4 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Rank</th>
                                        <th className="px-4 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Partner Identity</th>
                                        <th className="px-4 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Volume</th>
                                        <th className="px-4 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Total Yield</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {performers?.topReferrers?.map((row: any, i: number) => (
                                        <tr key={i} className="group hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-black w-7 h-7 flex items-center justify-center rounded-xl border ${i < 3 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-lg' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col"><span className="text-sm font-black text-slate-700">{row.name}</span><span className="text-[10px] text-slate-500 uppercase">{row.email}</span></div>
                                            </td>
                                            <td className="px-4 py-3 text-right"><span className="text-xs font-black text-slate-500 tabular-nums">{row.count} events</span></td>
                                            <td className="px-4 py-3 text-right"><span className="text-sm font-black text-emerald-600 tabular-nums">{currency}{(row.totalEarned || row.totalProfit || 0).toLocaleString()}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-surface border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                        <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Platform Earnings History</h3>
                            {pagination && <span className="text-[10px] font-black text-indigo-600 bg-indigo-500/10 px-3 py-1 rounded-full uppercase border border-indigo-500/20">{pagination.total} Records</span>}
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead className="sticky top-0 z-10"><tr className="bg-slate-50/80 border-b border-slate-100"><th className="px-4 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Activity Node</th><th className="px-4 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Partner</th><th className="px-4 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Net Yield</th><th className="px-4 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Timestamp</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.map((item: any, i: number) => (
                                        <tr key={i} className="group hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3"><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${item.type === 'referral_bonus' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : item.type === 'agent_profit' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-300'}`}></div><span className="text-[10px] font-black text-slate-600 uppercase">{item.type.replace('_', ' ')}</span></div></td>
                                            <td className="px-4 py-3"><div className="flex flex-col"><span className="text-xs font-black text-slate-700">{item.userName}</span><span className="text-[9px] text-slate-600 font-bold uppercase truncate max-w-[140px]">{item.userEmail}</span></div></td>
                                            <td className="px-4 py-3 text-right"><span className={`text-sm font-black tabular-nums ${item.type === 'referral_redeem' ? 'text-rose-600' : 'text-emerald-600'}`}>{currency}{item.amount.toLocaleString()}</span></td>
                                            <td className="px-4 py-3 text-right font-mono text-[10px] text-slate-600">{format(new Date(item.createdAt), "HH:mm:ss · MMM dd")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Rules & Logic */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                        <ShieldCheck className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity" size={160} />
                        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3"><ShieldCheck className="text-emerald-600" size={28} />Platform Guardrails</h3>
                        <div className="space-y-6">
                            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center justify-between">
                                <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase">Standard Cap</p><h4 className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{(caps?.maxReferralProfitShare * 100).toFixed(0)}%</h4></div>
                                <Info size={14} className="text-slate-600" />
                            </div>

                        </div>
                        <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed opacity-80">Global integrity protocols prevent platform loss by dynamically capping payouts when service margins shrink.</p>
                            <button className="w-full bg-slate-950 border border-slate-800 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-surface hover:text-slate-950 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"><Zap size={14} /> Adjust Guardrails</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayoutDynamicsTab;
