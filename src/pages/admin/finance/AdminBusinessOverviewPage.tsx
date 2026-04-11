import React, { useEffect, useState, useMemo } from 'react';
import {
    BadgeDollarSign,
    Activity,
    TrendingUp,
    Wallet as WalletIcon,
    Loader2,
    AlertCircle,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    ShieldCheck,
    Banknote,
    Receipt,
    RefreshCw,
    HandCoins,
    Percent,
    Info,
    ArrowRightCircle
} from 'lucide-react';
import { getBusinessOverview } from '../../../services/admin/adminBusinessService';

const AdminBusinessOverviewPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [period, setPeriod] = useState('this-month');
    const [customStartDate, setCustomStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>(['transaction', 'expense', 'settlement']);

    const fetchOverview = async (periodType: string) => {
        try {
            setLoading(true);
            let params: any = {};
            const now = new Date();

            if (periodType === 'this-month') {
                params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            } else if (periodType === 'last-30-days') {
                const last30 = new Date();
                last30.setDate(now.getDate() - 30);
                params.startDate = last30.toISOString();
            } else if (periodType === 'custom') {
                params.startDate = new Date(customStartDate).toISOString();
                params.endDate = new Date(customEndDate).toISOString();
            } else if (periodType === 'all-time') {
                // No startDate/endDate params
            }

            const response = await getBusinessOverview(params);
            if (response.success) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to load business data');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview(period);
    }, [period]);

    const filteredFlow = useMemo(() => {
        if (!data?.unifiedFlow) return [];
        return data.unifiedFlow.filter((item: any) => {
            if (!item) return false;
            const matchesSearch = item.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.refId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.reference?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilters.includes(item.flowType);
            return matchesSearch && matchesFilter;
        });
    }, [data, searchQuery, activeFilters]);

    const toggleFilter = (type: string) => {
        setActiveFilters(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    if (loading && !data) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-indigo-400" />
                    </div>
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Filtering Financial Noise...</p>
            </div>
        );
    }

    const {
        totalRevenue,
        totalCost,
        grossProfit,
        totalExpenses,
        netProfit,
        operatingMargin,
        investmentInflow,
        agentDiscounts,
        referralCommissions
    } = data || {};

    const stats = [
        { title: 'Sales Revenue', value: totalRevenue, icon: BadgeDollarSign, color: 'emerald', desc: 'Net cash from VTU sales', tooltip: 'The total money received from users for their purchases (calculated after any Agent Discounts).' },
        { title: 'Cost of Sales', value: totalCost, icon: WalletIcon, color: 'blue', desc: 'Provider cost + Commissions', tooltip: 'The total cost to fulfill these sales. This equals Your [Service Inventory Cost] + [Referral Commissions] paid out.' },
        { title: 'Gross Profit', value: grossProfit, icon: TrendingUp, color: 'indigo', desc: 'Revenue - Fulfillment Cost', tooltip: 'Your profit from selling data and airtime. Note: This is BEFORE deducting your monthly Overhead (like servers/staff).' },
        { title: 'Operating Margin', value: `${(operatingMargin || 0).toFixed(1)}%`, icon: Activity, color: 'amber', desc: 'Operational Efficiency', tooltip: 'Your Gross Profit expressed as a percentage of your total Sales Revenue.' }
    ];

    const getFlowConfig = (item: any) => {
        if (!item) return { icon: AlertCircle, bg: 'bg-slate-50', text: 'text-slate-600', label: 'Unknown', amountColor: 'text-slate-400' };

        switch (item.flowType) {
            case 'expense':
                return { icon: Receipt, bg: 'bg-rose-50', text: 'text-rose-600', label: 'Expense', amountColor: 'text-rose-600' };
            case 'settlement':
                return { icon: RefreshCw, bg: 'bg-amber-50', text: 'text-amber-600', label: 'Settlement', amountColor: 'text-amber-600' };
            case 'transaction':
                if (item.type === 'withdrawal') {
                    return { icon: ArrowDownRight, bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Withdrawal', amountColor: 'text-indigo-600' };
                }
                if (item.type === 'share_purchase') {
                    return { icon: HandCoins, bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Capital', amountColor: 'text-emerald-700' };
                }
                return { icon: ArrowUpRight, bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Sale', amountColor: 'text-emerald-600' };
            default:
                return { icon: CreditCard, bg: 'bg-slate-50', text: 'text-slate-600', label: 'Activity', amountColor: 'text-slate-800' };
        }
    };

    // Helper for generating manual colors based on status (fixed Tailwind JIT issue)
    const getColorClasses = (color: string) => {
        const maps: any = {
            emerald: 'bg-emerald-50 text-emerald-600 hover:border-emerald-100',
            blue: 'bg-blue-50 text-blue-600 hover:border-blue-100',
            indigo: 'bg-indigo-50 text-indigo-600 hover:border-indigo-100',
            amber: 'bg-amber-50 text-amber-600 hover:border-amber-100'
        };
        return maps[color] || 'bg-slate-50 text-slate-600';
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header & Period Slicer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        Business Overview
                        {loading && <Loader2 className="w-5 h-5 text-indigo-300 animate-spin" />}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Strategic financial diagnostics for platform operations.</p>
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
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${period === opt.id
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Date Picker Row */}
            {period === 'custom' && (
                <div className="flex flex-wrap items-end gap-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">From</label>
                        <input 
                            type="date" 
                            className="bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500/20 transition-all block w-full sm:w-48 appearance-none color-scheme-dark"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">To</label>
                        <input 
                            type="date" 
                            className="bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500/20 transition-all block w-full sm:w-48 appearance-none color-scheme-dark"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => fetchOverview('custom')}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        Apply Filter
                    </button>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                    <button onClick={() => fetchOverview(period)} className="ml-auto text-xs underline font-black uppercase">Retry</button>
                </div>
            )}

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 pb-2 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{stat.title}</p>
                            <div className="group/tip">
                                <Info size={14} className="text-slate-200 cursor-help hover:text-indigo-500 transition-colors" />
                                <div className="absolute top-2 right-2 w-64 bg-slate-900 text-white p-4 rounded-2xl text-[11px] font-medium opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl leading-relaxed">
                                    {stat.tooltip}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${getColorClasses(stat.color).split(' ')[0]} ${getColorClasses(stat.color).split(' ')[1]}`}>
                                <stat.icon size={24} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter truncate">
                                {typeof stat.value === 'number' ? `₦${stat.value.toLocaleString()}` : stat.value}
                            </h3>
                        </div>

                        <p className="text-[10px] text-slate-400 text-center font-bold truncate opacity-70">{stat.desc}</p>
                    </div>
                ))}

                {/* Investment Inflow Card */}
                <div className="bg-emerald-600 p-6 rounded-[2rem] border border-emerald-500 shadow-lg shadow-emerald-500/20 transition-all group relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <HandCoins size={60} />
                    </div>

                    <div className="flex items-center justify-between mb-2 relative z-10">
                        <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest truncate">Share Capital</p>
                    </div>

                    <div className="flex items-center gap-4 mb-2 relative z-10">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center">
                            <HandCoins size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tighter truncate">
                            ₦{(investmentInflow || 0).toLocaleString()}
                        </h3>
                    </div>

                    <p className="text-[10px] text-emerald-100 text-center font-bold truncate opacity-80 relative z-10">Investment Inflow</p>
                </div>
            </div>

            {/* Earnings Breakdown Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-sm">
                <div className="flex items-center gap-4 p-4 border border-slate-800 rounded-3xl bg-slate-900/30">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm">
                        <Percent size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Discounts (Earnings)</p>
                        <p className="text-xl font-black text-white tracking-tight">₦{(agentDiscounts || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">Revenue given back to resellers</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 border border-slate-800 rounded-3xl bg-slate-900/30">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
                        <ArrowRightCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referral Payouts (Earnings)</p>
                        <p className="text-xl font-black text-white tracking-tight">₦{(referralCommissions || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">Commissions paid for referrals</p>
                    </div>
                </div>
            </div>

            {/* Middle Section: Ledger & Corporate Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Real-time Ledger */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 pb-4 border-b border-slate-50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Real-time Ledger</h3>
                                <p className="text-slate-400 text-xs font-medium">Monitoring platform activities</p>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Transaction ID..."
                                    className="pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold w-full sm:w-64 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Ledger Filters */}
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { id: 'transaction', label: 'Sales/Investments', color: 'emerald' },
                                { id: 'expense', label: 'Overhead Expenses', color: 'rose' },
                                { id: 'settlement', label: 'Provider Settlements', color: 'amber' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => toggleFilter(f.id)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilters.includes(f.id)
                                        ? `bg-slate-900 text-white shadow-lg shadow-slate-200`
                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[500px] p-6 pt-2">
                        {filteredFlow.length > 0 ? (
                            <div className="space-y-3">
                                {filteredFlow.map((item: any, idx: number) => {
                                    const config = getFlowConfig(item);
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl ${config.bg} ${config.text} flex items-center justify-center shadow-sm`}>
                                                    <config.icon size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-slate-800">{config.label}</p>
                                                        <span className="text-[10px] font-bold text-slate-300">•</span>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5 group-hover:text-indigo-500 transition-colors">
                                                        #{item.transactionId || item.reference || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-black ${config.amountColor}`}>
                                                    {item.flowType === 'expense' || item.flowType === 'settlement' || item.type === 'withdrawal' ? '-' : '+'}
                                                    ₦{(item.amount || 0).toLocaleString()}
                                                </p>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.service || item.title || item.provider || 'System'}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                                <Activity className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-50">Flow Silent</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Corporate Performance Card */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-10 pt-16 relative overflow-hidden shadow-2xl shadow-indigo-500/10 min-h-[400px] flex flex-col justify-between border border-slate-800">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />

                        <div className="relative z-10">
                            <ShieldCheck className="text-emerald-400 mb-6" size={40} />
                            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Net Corporate Performance</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter leading-tight">
                                ₦{(netProfit || 0).toLocaleString()}
                            </h2>
                            <div className="flex items-center gap-2 mt-4 text-emerald-400">
                                <TrendingUp size={16} />
                                <span className="text-xs font-black uppercase tracking-widest italic">Core Liquidity</span>
                            </div>
                        </div>

                        <div className="relative z-10 pt-10 mt-10 border-t border-slate-800">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-1">Deducted Overhead</p>
                                    <p className="text-rose-400 font-black text-xl tracking-tight">-₦{(totalExpenses || 0).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-1">Op. Efficiency</p>
                                    <p className="text-white font-black text-xl tracking-tight">{(operatingMargin || 0).toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Metrics / Quick Tips */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] mb-1">Business Wallet Inflow</p>
                            <p className="text-2xl font-black text-slate-800 tracking-tighter">₦{(totalRevenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                            <Banknote size={24} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminBusinessOverviewPage;
