import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    History,
    Loader2,
    Activity
} from "lucide-react";
import { format } from "date-fns";
import { useAdminEarnings } from "../../hooks/admin/useAdminAnalytics";
import { useWalletStore } from "../../store/wallet/walletStore";
import { CardSkeleton, ListSkeleton } from "../../components/feedback/Skeletons";

const AdminEarningsPage: React.FC = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [period, setPeriod] = useState('this-month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // State for actually applied filters to trigger query
    const [appliedFilters, setAppliedFilters] = useState<any>({
        page: 1,
        limit: 25,
        search: '',
        type: 'all',
        startDate: '',
        endDate: ''
    });

    // Helper to calculate dates based on period
    const calculateDates = (selectedPeriod: string) => {
        let start = '';
        let end = '';
        const now = new Date();

        if (selectedPeriod === 'this-month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        } else if (selectedPeriod === 'last-30-days') {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            start = d.toISOString();
        } else if (selectedPeriod === 'custom') {
            start = customStartDate;
            end = customEndDate;
        }
        return { start, end };
    };

    // Effect to handle predefined period changes
    React.useEffect(() => {
        if (period !== 'custom') {
            const { start, end } = calculateDates(period);
            setAppliedFilters((prev: any) => ({
                ...prev,
                startDate: start,
                endDate: end,
                page: 1
            }));
            setPage(1);
        }
    }, [period]);

    const handleApplyFilters = () => {
        const { start, end } = calculateDates(period);
        setAppliedFilters({
            page: 1,
            limit: 25,
            search,
            type,
            startDate: start,
            endDate: end
        });
        setPage(1);
    };

    const { data: analytics, isLoading, error } = useAdminEarnings({
        ...appliedFilters,
        page: page // keep page reactive
    });

    const { currency } = useWalletStore();
    const [activeTab, setActiveTab] = useState<'referrers' | 'agents'>('referrers');

    if (error) {
        return (
            <div className="p-12 text-center text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem]">
                <AlertCircle className="mx-auto mb-4" size={48} />
                <h2 className="text-xl font-bold">Diagnostics Offline</h2>
                <p className="text-sm opacity-70">Neural link to financial subsystem interrupted. Verify authorization protocols.</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Retry Connection</button>
            </div>
        );
    }

    const overview = analytics?.data?.overview;
    const performers = analytics?.data?.performers;
    const caps = analytics?.data?.caps;
    const history = analytics?.data?.history || [];
    const pagination = analytics?.data?.pagination;

    const statsCards = [
        {
            label: "Referral Payouts",
            value: (overview?.totalReferralPayouts || 0),
            icon: Users,
            color: "emerald",
            desc: "Cumulative commissions disbursed",
            tooltip: "Total sum of all referral bonuses successfully credited to users' referral balances."
        },
        {
            label: "Agent Profits",
            value: (overview?.totalAgentProfits || 0),
            icon: Briefcase,
            color: "blue",
            desc: "Net yield from reseller activity",
            tooltip: "The total discount margin enjoyed by agents across all successful VTU sales."
        },
        {
            label: "Capped Events",
            value: overview?.cappedCommissionsCount || 0,
            icon: ShieldCheck,
            color: "amber",
            desc: "Margin-protected transactions",
            tooltip: "Count of transactions where commission was limited by the Platform Guardrails to prevent losses."
        },
        {
            label: "Skipped (Low Margin)",
            value: overview?.skippedCommissionsCount || 0,
            icon: Zap,
            color: "slate",
            desc: "Zero-yield commission bypass",
            tooltip: "Transactions where the profit margin was too low to support any referral payout."
        },
    ];

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'emerald': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 shadow-emerald-500/5';
            case 'blue': return 'bg-blue-500/10 border-blue-500/20 text-blue-500 hover:bg-blue-500/20 shadow-blue-500/5';
            case 'amber': return 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20 shadow-amber-500/5';
            default: return 'bg-slate-500/10 border-slate-500/20 text-slate-500 hover:bg-slate-500/20 shadow-slate-500/5';
        }
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header & Period Slicer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Earnings Analytics</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Strategic oversight of platform profit distribution.</p>
                </div>
                
                <div className="flex flex-wrap items-center bg-slate-800/50 p-1 rounded-2xl border border-slate-700 shadow-sm backdrop-blur-md">
                    {[
                        { id: 'this-month', label: 'This Month' },
                        { id: 'last-30-days', label: 'Last 30 Days' },
                        { id: 'all-time', label: 'All Time' },
                        { id: 'custom', label: 'Custom Range' }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setPeriod(opt.id)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === opt.id
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
                ) : (
                    statsCards.map((card, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col space-y-4 hover:border-slate-700 transition-all group relative overflow-hidden backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.label}</p>
                                <div className="group/tip">
                                    <Info size={14} className="text-slate-600 cursor-help hover:text-indigo-400" />
                                    <div className="absolute top-4 right-4 w-64 bg-slate-900 border border-slate-800 text-slate-300 p-4 rounded-2xl text-[11px] opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl leading-relaxed">
                                        {card.tooltip}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 border ${getColorClasses(card.color)}`}>
                                    <card.icon size={28} />
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums">
                                    {typeof card.value === 'number' && card.label.includes('NGN') ? `${currency}${card.value.toLocaleString()}` : 
                                     typeof card.value === 'number' && !card.label.includes('Events') ? `${currency}${card.value.toLocaleString()}` :
                                     card.value.toLocaleString()}
                                </h3>
                            </div>

                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-70 mt-auto">{card.desc}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Filter Bar */}
            <div className={`bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800 backdrop-blur-md flex flex-wrap items-end gap-6 shadow-2xl transition-all duration-500 ${period === 'custom' ? 'border-indigo-500/30 ring-1 ring-indigo-500/10' : ''}`}>
                <div className="flex-1 min-w-[280px] space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Search</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Name, Email, or Transaction ID..."
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-sm font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full sm:w-48 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entry Type</label>
                    <select 
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">All Activities</option>
                        <option value="referral_bonus">Referral Bonus</option>
                        <option value="agent_profit">Agent Profit</option>
                        <option value="referral_redeem">Redemptions</option>
                        <option value="referral_skipped">Skipped</option>
                    </select>
                </div>

                {period === 'custom' && (
                    <div className="flex flex-wrap items-end gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">From</label>
                            <input 
                                type="date" 
                                className="px-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500/20 outline-none color-scheme-dark w-44"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">To</label>
                            <input 
                                type="date" 
                                className="px-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500/20 outline-none color-scheme-dark w-44"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <button 
                    onClick={handleApplyFilters}
                    className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-3 h-[50px]"
                >
                    <Zap size={14} className={isLoading ? 'animate-pulse' : ''} />
                    Apply Filter
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Top Performers */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
                        <div className="bg-slate-800/30 border-b border-white/5 px-8 py-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight italic">Top Yield Performers</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global conversion leaders</p>
                                </div>
                            </div>
                            <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700">
                                <button 
                                    onClick={() => setActiveTab('referrers')}
                                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'referrers' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Referrers
                                </button>
                                <button 
                                    onClick={() => setActiveTab('agents')}
                                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'agents' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Agents
                                </button>
                            </div>
                        </div>

                        <div className="p-0 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.01]">
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Rank</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Partner Identity</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Volume</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Yield</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr><td colSpan={4} className="p-12"><ListSkeleton count={5} /></td></tr>
                                    ) : (
                                        (activeTab === 'referrers' ? performers?.topReferrers : performers?.topAgents)?.map((row: any, i: number) => (
                                            <tr key={i} className="group hover:bg-white/[0.02] transition-colors cursor-default">
                                                <td className="px-8 py-6">
                                                    <span className={`text-[10px] font-black leading-none w-7 h-7 flex items-center justify-center rounded-xl border ${i < 3 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
                                                        {i + 1}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-200 tracking-tight">{row.name}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{row.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-xs font-black text-slate-500 tabular-nums">{row.count} events</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-sm font-black text-emerald-400 tracking-tighter tabular-nums">
                                                        {currency}{(row.totalEarned || row.totalProfit || 0).toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    {!isLoading && (!performers || (activeTab === 'referrers' ? performers.topReferrers.length : performers.topAgents.length) === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-slate-600">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <Users size={40} />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No performance nodes detected</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Unified History Feed */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col min-h-[700px]">
                        <div className="bg-slate-800/30 border-b border-white/5 px-8 py-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                                    <History size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight italic">Platform Earnings History</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Deep-ledger transactional stream</p>
                                </div>
                            </div>
                            {pagination && (
                                <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20">
                                    {pagination.total} Records Found
                                </span>
                            )}
                        </div>

                        <div className="p-0 overflow-x-auto flex-1">
                            <table className="w-full">
                                <thead className="sticky top-0 z-10">
                                    <tr className="border-b border-white/5 bg-slate-950">
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Activity Node</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Partner</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Net Yield</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Diagnostic</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" size={32} /></td></tr>
                                    ) : (
                                        history.map((item: any, i: number) => (
                                            <tr key={i} className="group hover:bg-white/[0.01] transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            item.type === 'referral_bonus' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                            item.type === 'agent_profit' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                                                            item.type === 'referral_redeem' ? 'bg-rose-500' :
                                                            'bg-slate-700'
                                                        }`}></div>
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                            {item.type.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-200 tracking-tight">{item.userName}</span>
                                                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest truncate max-w-[140px] italic">{item.userEmail}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className={`text-sm font-black tracking-tighter tabular-nums ${item.type === 'referral_redeem' ? 'text-rose-400' : item.type === 'referral_skipped' ? 'text-slate-600' : 'text-emerald-400'}`}>
                                                        {item.type === 'referral_skipped' ? '—' : `${item.type === 'referral_redeem' ? '-' : '+'}${currency}${item.amount.toLocaleString()}`}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.wasCapped && (
                                                            <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-2 py-1 rounded-lg border border-amber-500/20 uppercase tracking-widest leading-none flex items-center gap-1">
                                                                <ShieldCheck size={10} /> Capped
                                                            </span>
                                                        )}
                                                        {item.buyerRole && (
                                                            <span className="bg-slate-800 text-slate-400 text-[9px] font-black px-2 py-1 rounded-lg border border-slate-700 uppercase tracking-widest leading-none">
                                                                {item.buyerRole}
                                                            </span>
                                                        )}
                                                        {item.status === 'skipped' && (
                                                            <span className="bg-rose-500/10 text-rose-500 text-[9px] font-black px-2 py-1 rounded-lg border border-rose-500/20 uppercase tracking-widest leading-none italic">
                                                                Low Margin
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right font-mono text-[10px] text-slate-600">
                                                    {format(new Date(item.createdAt), "HH:mm:ss · MMM dd")}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {pagination && pagination.pages > 1 && (
                            <div className="px-8 py-6 border-t border-white/5 bg-slate-800/20 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    Showing Page {pagination.page} <span className="text-slate-700 mx-2">/</span> {pagination.pages}
                                </p>
                                <div className="flex items-center gap-4">
                                    <button 
                                        disabled={pagination.page === 1 || isLoading}
                                        onClick={() => setPage(p => p - 1)}
                                        className="px-6 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:bg-slate-700 transition-all disabled:opacity-20 flex items-center gap-2"
                                    >
                                        Previous
                                    </button>
                                    <button 
                                        disabled={pagination.page === pagination.pages || isLoading}
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-6 py-2 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-20 flex items-center gap-2"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Rules & Logic */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                            <ShieldCheck size={160} />
                        </div>
                        
                        <h3 className="text-2xl font-black text-white mb-8 italic flex items-center gap-3">
                            <ShieldCheck className="text-emerald-400" size={28} />
                            Platform Guardrails
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-3xl flex items-center justify-between hover:bg-slate-800/60 transition-all">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Standard Cap</p>
                                    <h4 className="text-2xl font-black text-white tracking-tighter tabular-nums">{(caps?.maxReferralProfitShare * 100).toFixed(0)}%</h4>
                                </div>
                                <div className="group/tip relative">
                                    <Info size={14} className="text-slate-600 cursor-help" />
                                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-950 p-3 rounded-xl text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-slate-800 shadow-2xl">
                                        Maximum percentage of profit distributed as referral commissions.
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-3xl flex items-center justify-between hover:bg-slate-800/60 transition-all">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agent Performer Cap</p>
                                    <h4 className="text-2xl font-black text-white tracking-tighter tabular-nums">{(caps?.maxAgentReferralShare * 100).toFixed(0)}%</h4>
                                </div>
                                <div className="group/tip relative">
                                    <Info size={14} className="text-slate-600 cursor-help" />
                                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-950 p-3 rounded-xl text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-slate-800 shadow-2xl">
                                        Upper limit for agent discounts to ensure corporate viability.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 p-6 bg-slate-800/20 border border-slate-800 rounded-[2rem] space-y-4">
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic opacity-80">
                                Global integrity protocols prevent platform loss by dynamically capping payouts when service margins shrink.
                            </p>
                            <button 
                                onClick={() => navigate('/admin/business/commissions')}
                                className="w-full bg-slate-800 border border-slate-700 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-slate-950 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <Zap size={14} /> Adjust Guardrails
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                         <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
                        
                        <h3 className="text-xl font-black text-white mb-8 italic flex items-center gap-3">
                            <Activity className="text-indigo-400" size={24} />
                            Efficiency Analytics
                        </h3>
                        
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payout Efficiency</p>
                                        <p className="text-xs text-white font-black tracking-tight">{((1 - (overview?.cappedCommissionsCount / (overview?.totalReferralPayouts || 1))) * 100).toFixed(0)}% Health Index</p>
                                    </div>
                                </div>
                                
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-white/5 p-px">
                                    <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: '94%' }} />
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed">System is successfully fulfilling the majority of commission requests at the requested rates.</p>
                            </div>

                            <div className="p-6 bg-slate-800/40 rounded-[2.5rem] border border-dashed border-slate-700 text-center space-y-2">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] block">Avg System Payload</span>
                                <div className="flex items-center justify-center gap-2">
                                    <Users size={16} className="text-slate-600" />
                                    <span className="text-xl font-black text-slate-400 tabular-nums">
                                        {overview?.totalReferralPayouts > 0 ? (overview?.totalReferralPayouts / (overview?.totalReferralPayouts + overview?.totalAgentProfits) * 100).toFixed(1) : '0'}%
                                    </span>
                                </div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Referral Distribution Mix</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEarningsPage;
