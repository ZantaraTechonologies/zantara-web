import React, { useState } from "react";
import {
    TrendingUp,
    ShieldCheck,
    Briefcase,
    Zap,
    Users,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronRight,
    Search,
    Filter,
    ExternalLink,
    AlertCircle,
    Info,
    History
} from "lucide-react";
import { format } from "date-fns";
import { useAdminEarnings } from "../../hooks/admin/useAdminAnalytics";
import { useWalletStore } from "../../store/wallet/walletStore";
import { CardSkeleton, ListSkeleton } from "../../components/feedback/Skeletons";

const AdminEarningsPage: React.FC = () => {
    const { data: analytics, isLoading, error } = useAdminEarnings();
    const { currency } = useWalletStore();
    const [activeTab, setActiveTab] = useState<'referrers' | 'agents'>('referrers');

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertCircle className="mx-auto mb-4" size={48} />
                <h2 className="text-xl font-bold">Failed to load earnings analytics</h2>
                <p className="text-sm opacity-70">Please check your connection or contact system support.</p>
            </div>
        );
    }

    const overview = analytics?.data?.overview;
    const performers = analytics?.data?.performers;
    const caps = analytics?.data?.caps;
    const history = analytics?.data?.history || [];

    const statsCards = [
        {
            label: "Total Referral Payouts",
            value: `${currency}${overview?.totalReferralPayouts?.toLocaleString() || "0"}`,
            icon: Users,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Total Agent Profits",
            value: `${currency}${overview?.totalAgentProfits?.toLocaleString() || "0"}`,
            icon: Briefcase,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            label: "Capped Commissions",
            value: overview?.cappedCommissionsCount?.toString() || "0",
            icon: ShieldCheck,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            detail: "Margin Protected",
        },
        {
            label: "Skipped (Low Margin)",
            value: overview?.skippedCommissionsCount?.toString() || "0",
            icon: Zap,
            color: "text-slate-400",
            bg: "bg-slate-500/10",
            detail: "Zero Yield cases",
        },
    ];

    return (
        <div className="space-y-6 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Earnings Analytics</h1>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Platform-Wide Commission Oversight</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/10">Real-Time</button>
                        <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors">Historical</button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
                ) : (
                    statsCards.map((card, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-3 hover:border-white/10 transition-all">
                            <div className="flex justify-between items-start">
                                <div className={`p-2 ${card.bg} rounded-lg ${card.color}`}>
                                    <card.icon size={18} />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full tracking-wider">LIVE</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
                                    {card.detail && <span className="text-[9px] font-bold text-slate-600">{card.detail}</span>}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Top Performers */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-white/[0.02] border-b border-white/5 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="text-emerald-400" size={20} />
                                <h3 className="text-lg font-bold text-white italic">Top Yield Performers</h3>
                            </div>
                            <div className="flex bg-white/5 p-1 rounded-xl">
                                <button 
                                    onClick={() => setActiveTab('referrers')}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'referrers' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Referrers
                                </button>
                                <button 
                                    onClick={() => setActiveTab('agents')}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'agents' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Agents
                                </button>
                            </div>
                        </div>

                        <div className="p-0 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.01]">
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rank</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">User Identity</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transaction Count</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Yield</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr><td colSpan={4} className="p-6"><ListSkeleton count={5} /></td></tr>
                                    ) : (
                                        (activeTab === 'referrers' ? performers?.topReferrers : performers?.topAgents)?.map((row: any, i: number) => (
                                            <tr key={i} className="group hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-bold leading-none w-6 h-6 flex items-center justify-center rounded-lg ${i < 3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                                                        #{i + 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-200">{row.name}</span>
                                                        <span className="text-[10px] text-slate-600 font-mono italic">{row.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-medium text-slate-400">{row.count} events</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-bold text-white tracking-tight">
                                                        {currency}{(row.totalEarned || row.totalProfit || 0).toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    {!isLoading && (!performers || (activeTab === 'referrers' ? performers.topReferrers.length : performers.topAgents.length) === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm italic">
                                                No performance data available for this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Unified History Feed */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-white/[0.02] border-b border-white/5 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <History className="text-slate-400" size={20} />
                                <h3 className="text-lg font-bold text-white italic">Platform Earnings History</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latest 50 Events</span>
                        </div>

                        <div className="p-0 overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                            <table className="w-full">
                                <thead className="sticky top-0 z-10">
                                    <tr className="border-b border-white/5 bg-slate-900">
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entity</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Details</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="p-6 text-center"><Zap className="animate-pulse mx-auto text-emerald-500" /></td></tr>
                                    ) : (
                                        history.map((item: any, i: number) => (
                                            <tr key={i} className="group hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                                            item.type === 'referral_bonus' ? 'bg-emerald-500' :
                                                            item.type === 'agent_profit' ? 'bg-blue-500' :
                                                            item.type === 'referral_redeem' ? 'bg-red-500' :
                                                            'bg-slate-500 animate-pulse'
                                                        }`}></div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            {item.type.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-200">{item.userName}</span>
                                                        <span className="text-[9px] text-slate-600 font-mono truncate max-w-[120px]">{item.userEmail}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`text-sm font-bold tracking-tight ${item.type === 'referral_redeem' ? 'text-red-400' : item.type === 'referral_skipped' ? 'text-slate-600' : 'text-emerald-400'}`}>
                                                        {item.type === 'referral_skipped' ? '—' : `${item.type === 'referral_redeem' ? '-' : '+'}${currency}${item.amount.toLocaleString()}`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {item.wasCapped && (
                                                            <span className="bg-orange-500/10 text-orange-500 text-[9px] font-bold px-2 py-0.5 rounded leading-none flex items-center gap-1">
                                                                <ShieldCheck size={10} /> Capped
                                                            </span>
                                                        )}
                                                        {item.buyerRole && (
                                                            <span className="bg-white/5 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded leading-none">
                                                                {item.buyerRole} buyer
                                                            </span>
                                                        )}
                                                        {item.status === 'skipped' && (
                                                            <span className="bg-slate-500/10 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded leading-none italic">
                                                                Low Margin
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-[10px] font-medium text-slate-600 tabular-nums">
                                                        {format(new Date(item.createdAt), "HH:mm:ss · MMM dd")}
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

                {/* Right: Rules & Logic */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                            <ShieldCheck size={120} />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-6 italic flex items-center gap-3">
                            <ShieldCheck className="text-emerald-400" size={24} />
                            Platform Guardrails
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Standard Cap</p>
                                    <h4 className="text-xl font-bold text-white tabular-nums">{(caps?.maxReferralProfitShare * 100).toFixed(0)}%</h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">Max Profit Share</span>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Agent Performer Cap</p>
                                    <h4 className="text-xl font-bold text-white tabular-nums">{(caps?.maxAgentReferralShare * 100).toFixed(0)}%</h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">Consolidated Yield</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex gap-3">
                                <Info className="text-slate-600 shrink-0" size={16} />
                                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                                    Commission caps prevent the platform from operating at a loss during high-commission/low-margin periods. 
                                </p>
                            </div>
                            <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/10 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2 group">
                                Adjust Global Settings
                                <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                         <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        <h3 className="text-lg font-bold text-white mb-6 italic flex items-center gap-3">
                            <Zap className="text-slate-400" size={20} />
                            Efficiency Analytics
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payout Efficiency</p>
                                    <p className="text-xs text-slate-200">System is processing 94% of possible commissions without hitting caps.</p>
                                </div>
                            </div>
                            
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[94%]" />
                            </div>

                            <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center">
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Average System Payload</span>
                                <span className="text-lg font-bold text-slate-400 tabular-nums">{currency}{(overview?.totalReferralPayouts / (overview?.totalReferralPayouts + overview?.totalAgentProfits || 1) * 100).toFixed(1)}% Referral Mix</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEarningsPage;
