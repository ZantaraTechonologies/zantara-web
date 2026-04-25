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
import { getBusinessOverview } from '../../../../services/admin/adminBusinessService';

interface Props {
    period: string;
    customDates: { start: string; end: string };
}

const StrategicPulseTab: React.FC<Props> = ({ period, customDates }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>(['transaction', 'expense', 'settlement']);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            let params: any = {};
            const now = new Date();

            if (period === 'this-month') {
                params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            } else if (period === 'last-30-days') {
                const last30 = new Date();
                last30.setDate(now.getDate() - 30);
                params.startDate = last30.toISOString();
            } else if (period === 'custom') {
                params.startDate = new Date(customDates.start).toISOString();
                params.endDate = new Date(customDates.end).toISOString();
            }

            const response = await getBusinessOverview(params);
            if (response.success) {
                setData(response.data);
                setError(null);
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
        fetchOverview();
    }, [period, customDates]);

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
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Pulse...</p>
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
        { title: 'Sales Revenue', value: totalRevenue, icon: BadgeDollarSign, color: 'emerald', desc: 'Net cash from VTU sales', tooltip: 'Total money received from users for purchases.' },
        { title: 'Cost of Sales', value: totalCost, icon: WalletIcon, color: 'blue', desc: 'Provider cost + Commissions', tooltip: 'Total cost to fulfill sales including payouts.' },
        { title: 'Gross Profit', value: grossProfit, icon: TrendingUp, color: 'indigo', desc: 'Revenue - Fulfillment Cost', tooltip: 'Profit before operating expenses.' },
        { title: 'Operating Margin', value: `${(operatingMargin || 0).toFixed(1)}%`, icon: Activity, color: 'amber', desc: 'Efficiency', tooltip: 'Gross profit as percentage of revenue.' }
    ];

    const getFlowConfig = (item: any) => {
        switch (item.flowType) {
            case 'expense': return { icon: Receipt, bg: 'bg-rose-50', text: 'text-rose-600', label: 'Expense' };
            case 'settlement': return { icon: RefreshCw, bg: 'bg-amber-50', text: 'text-amber-600', label: 'Settlement' };
            case 'transaction':
                if (item.type === 'withdrawal') return { icon: ArrowDownRight, bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Withdrawal' };
                if (item.type === 'share_purchase') return { icon: HandCoins, bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Capital' };
                return { icon: ArrowUpRight, bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Sale' };
            default: return { icon: CreditCard, bg: 'bg-slate-50', text: 'text-slate-600', label: 'Activity' };
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

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 pb-2 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                            <Info size={14} className="text-slate-200" />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                <stat.icon size={24} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">
                                {typeof stat.value === 'number' ? `₦${stat.value.toLocaleString()}` : stat.value}
                            </h3>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center font-bold truncate opacity-70">{stat.desc}</p>
                    </div>
                ))}

                <div className="bg-emerald-600 p-6 rounded-[2rem] border border-emerald-500 shadow-lg shadow-emerald-500/20 flex flex-col relative overflow-hidden group">
                    <HandCoins className="absolute top-0 right-0 p-2 opacity-10" size={60} />
                    <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-2 relative z-10">Share Capital</p>
                    <div className="flex items-center gap-4 mb-2 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center"><HandCoins size={24} /></div>
                        <h3 className="text-xl font-black text-white tracking-tighter">₦{(investmentInflow || 0).toLocaleString()}</h3>
                    </div>
                    <p className="text-[10px] text-emerald-100 text-center font-bold opacity-80 relative z-10">Total Inflow</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 pb-4 border-b border-slate-50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Real-time Ledger</h3>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search Ref..."
                                    className="pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold w-full sm:w-64 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {['transaction', 'expense', 'settlement'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => toggleFilter(f)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilters.includes(f) ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[500px] p-6 pt-2">
                        {filteredFlow.map((item: any, idx: number) => {
                            const config = getFlowConfig(item);
                            return (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl ${config.bg} ${config.text} flex items-center justify-center`}><config.icon size={20} /></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{config.label}</p>
                                            <p className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-indigo-500">#{item.transactionId || item.reference || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black ${item.flowType === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {item.flowType === 'expense' ? '-' : '+'}₦{(item.amount || 0).toLocaleString()}
                                        </p>
                                        <p className="text-[9px] font-black text-slate-300 uppercase">{item.service || 'System'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-10 pt-16 relative overflow-hidden shadow-2xl shadow-indigo-500/10 min-h-[400px] flex flex-col justify-between border border-slate-800">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
                        <div className="relative z-10">
                            <ShieldCheck className="text-emerald-400 mb-6" size={40} />
                            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Net Corporate Performance</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter">₦{(netProfit || 0).toLocaleString()}</h2>
                        </div>
                        <div className="relative z-10 pt-10 border-t border-slate-800 flex justify-between">
                            <div><p className="text-slate-500 font-black uppercase text-[9px] mb-1">Overhead</p><p className="text-rose-400 font-black text-xl">-₦{(totalExpenses || 0).toLocaleString()}</p></div>
                            <div className="text-right"><p className="text-slate-500 font-black uppercase text-[9px] mb-1">Efficiency</p><p className="text-white font-black text-xl">{(operatingMargin || 0).toFixed(1)}%</p></div>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-sm grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-4 p-4 border border-slate-800 rounded-3xl bg-slate-900/30">
                            <Percent className="text-indigo-400" size={24} />
                            <div><p className="text-[10px] font-black text-slate-400 uppercase">Agent Discounts</p><p className="text-xl font-black text-white">₦{(agentDiscounts || 0).toLocaleString()}</p></div>
                        </div>
                        <div className="flex items-center gap-4 p-4 border border-slate-800 rounded-3xl bg-slate-900/30">
                            <ArrowRightCircle className="text-emerald-400" size={24} />
                            <div><p className="text-[10px] font-black text-slate-400 uppercase">Referral Payouts</p><p className="text-xl font-black text-white">₦{(referralCommissions || 0).toLocaleString()}</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StrategicPulseTab;
