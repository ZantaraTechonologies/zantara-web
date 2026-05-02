import React, { useState } from 'react';
import { 
    Users, 
    TrendingUp, 
    Banknote, 
    ArrowUpRight, 
    ShieldCheck, 
    AlertCircle, 
    Search,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Info,
    RefreshCw,
    PieChart,
    LogOut,
    BarChart3,
    Clock,
    Activity
} from 'lucide-react';
import { 
    useAdminShareholderOverview, 
    useAdminShareholders, 
    useAdminPendingExits, 
    useAdminProcessExit,
    useAdminPendingDividendWithdrawals,
    useAdminProcessDividendWithdrawal,
    useAdminTriggerManualPayout
} from '../../hooks/admin/useAdminInvestment';
import { useWalletStore } from '../../store/wallet/walletStore';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ListSkeleton } from '../../components/feedback/Skeletons';

const AdminShareholdersPage: React.FC = () => {
    const { currency } = useWalletStore();
    const [activeTab, setActiveTab] = useState<'overview' | 'exits' | 'withdrawals'>('overview');
    const [search, setSearch] = useState('');

    const { data: overview, isLoading: overviewLoading } = useAdminShareholderOverview();
    const { data: shareholdersRes, isLoading: shareholdersLoading } = useAdminShareholders(1, 50);
    const { data: pendingExits, isLoading: exitsLoading } = useAdminPendingExits();
    const { data: pendingWithdrawals, isLoading: withdrawalsLoading } = useAdminPendingDividendWithdrawals();

    const { mutate: processExit, isPending: processingExit } = useAdminProcessExit();
    const { mutate: processWithdrawal, isPending: processingWithdrawal } = useAdminProcessDividendWithdrawal();
    const { mutate: triggerPayout, isPending: triggeringPayout } = useAdminTriggerManualPayout();

    const handleTriggerPayout = () => {
        if (!window.confirm('Are you sure you want to manually trigger the dividend payout for last month? This will credit all shareholders instantly.')) return;
        
        triggerPayout(undefined, {
            onSuccess: (res: any) => {
                if (res.data.success) {
                    toast.success(res.data.message);
                } else {
                    toast.error(res.data.message, { icon: '⚠️', duration: 5000 });
                }
            },
            onError: (err: any) => toast.error(err.response?.data?.message || 'Payout failed')
        });
    };

    const handleProcessExit = (id: string, action: 'approved' | 'rejected') => {
        const note = window.prompt(`Enter admin note for ${action}:`);
        processExit({ id, action, adminNote: note || '' }, {
            onSuccess: () => toast.success(`Exit request ${action}`),
            onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed')
        });
    };

    const handleProcessWithdrawal = (id: string, action: 'approved' | 'rejected') => {
        const note = window.prompt(`Enter admin note for ${action}:`);
        processWithdrawal({ id, action, adminNote: note || '' }, {
            onSuccess: () => toast.success(`Withdrawal ${action}`),
            onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed')
        });
    };

    // Filter shareholders based on search
    const filteredShareholders = shareholdersRes?.data?.filter((u: any) => 
        u.name?.toLowerCase().includes(search.toLowerCase()) || 
        u.phone?.includes(search)
    ) || [];

    if (overviewLoading) return <div className="p-10"><ListSkeleton count={5} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter italic">Shareholder Governance</h1>
                    <p className="text-slate-500 text-[10px] font-black tracking-[0.2em] mt-1 uppercase">Strategic Investment Management & Dividend Oversight</p>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={handleTriggerPayout}
                        disabled={triggeringPayout}
                        className="bg-emerald-500 text-slate-950 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={triggeringPayout ? 'animate-spin' : ''} />
                        Trigger Manual Payout
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Shareholders", value: overview?.totalShareholders || 0, icon: Users, color: "emerald", tooltip: "The count of unique users who currently hold active shares in the platform." },
                    { label: "Shares Issued", value: overview?.totalSharesIssued || 0, icon: PieChart, color: "blue", tooltip: "Total units of platform equity currently held by investors. This is backed by real capital inflow." },
                    { label: "Dividends Paid", value: `${currency}${(overview?.totalDividendsPaid || 0).toLocaleString()}`, icon: Banknote, color: "amber", tooltip: "Cumulative profits successfully distributed to shareholders since the platform launch." },
                    { label: "Profit Allocation", value: `${overview?.settings?.investorAllocationPercent || 20}%`, icon: TrendingUp, color: "emerald", tooltip: "The percentage of net service profits that are allocated to the shareholder dividend pool." },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] shadow-sm relative group">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <div className="group/tip">
                                <Info size={14} className="text-slate-700 hover:text-emerald-500 cursor-help transition-colors" />
                                <div className="absolute top-2 right-2 w-64 bg-slate-950 text-white p-4 rounded-2xl text-[11px] font-medium opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl leading-relaxed">
                                    {stat.tooltip}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <h4 className="text-3xl font-black text-white tracking-tighter italic">{stat.value}</h4>
                            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-700`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controller Bar */}
            <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Tabs */}
                <div className="flex bg-slate-950 p-1 rounded-2xl overflow-x-auto no-scrollbar shrink-0">
                    {[
                        { id: 'overview', label: 'Directory', icon: Users },
                        { id: 'exits', label: 'Exits', count: overview?.pendingExitRequests, icon: LogOut },
                        { id: 'withdrawals', label: 'Withdrawals', count: overview?.pendingWithdrawals, icon: Banknote }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                            {tab.count > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse border border-slate-950">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input 
                        type="text" 
                        placeholder="Scan investor directory by name or phone..."
                        className="w-full h-14 bg-slate-900 border border-white/5 rounded-2xl pl-12 pr-6 text-sm text-white font-medium outline-none focus:border-white/10 transition-all placeholder:text-slate-700 font-bold"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Areas */}
            <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {activeTab === 'overview' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-slate-950/50">
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Investor Entity</th>
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Holdings / Equity</th>
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Ledger Balances</th>
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-right">Acquisition</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredShareholders.length > 0 ? (
                                    filteredShareholders.map((user: any) => (
                                        <tr key={user._id} className="group hover:bg-white/[0.02] transition-all">
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-emerald-500/10 flex items-center justify-center font-black text-xs text-emerald-400">
                                                        {user.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white tracking-tight italic">{user.name}</p>
                                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-none mt-1">{user.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-emerald-500 italic">{user.sharesOwned} Shares</p>
                                                    {user.frozenShares > 0 && <p className="text-[9px] text-amber-500/60 font-black uppercase tracking-widest italic">{user.frozenShares} Locked in exit</p>}
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black text-white tracking-tighter tabular-nums">Wallet: {currency}{user.dividendBalance.toLocaleString()}</p>
                                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">Lifetime: {currency}{user.totalDividendsEarned.toLocaleString()}</p>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 text-right">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{user.firstSharePurchasedAt ? format(new Date(user.firstSharePurchasedAt), 'MMM dd, yyyy') : 'N/A'}</p>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                            <Activity className="mx-auto text-slate-800 mb-4 animate-pulse" size={48} />
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No matching investors found in registry</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'exits' && (
                    <div className="p-8">
                        {pendingExits?.length > 0 ? (
                            <div className="space-y-4">
                                {pendingExits.map((req: any) => (
                                    <div key={req._id} className="bg-slate-950 border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-amber-500/20 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                                <LogOut size={32} />
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="font-black text-white text-xl tracking-tighter italic">{req.userId?.name}</h5>
                                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    <span className="bg-slate-900 px-3 py-1 rounded-lg">Exiting: <span className="text-white">{req.sharesRequested} Shares</span></span>
                                                    <span className="bg-slate-900 px-3 py-1 rounded-lg">Net Return: <span className="text-white">{currency}{req.netAmount.toLocaleString()}</span></span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock size={12} className="text-amber-500/50" />
                                                    <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-tighter">Lock Expired: {format(new Date(req.lockExpiresAt), 'MMM dd, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleProcessExit(req._id, 'rejected')}
                                                disabled={processingExit}
                                                className="px-6 py-4 rounded-2xl bg-slate-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:border-rose-500/20 transition-all active:scale-95"
                                            >
                                                Deny Request
                                            </button>
                                            <button 
                                                onClick={() => handleProcessExit(req._id, 'approved')}
                                                disabled={processingExit}
                                                className="px-6 py-4 rounded-2xl bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                            >
                                                Authorize Return
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-800">
                                    <ShieldCheck size={40} />
                                </div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Registry Secure: No pending exits</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'withdrawals' && (
                    <div className="p-8">
                        {pendingWithdrawals?.length > 0 ? (
                            <div className="space-y-4">
                                {pendingWithdrawals.map((req: any) => (
                                    <div key={req._id} className="bg-slate-950 border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-emerald-500/20 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                                <Banknote size={32} />
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="font-black text-white text-xl tracking-tighter italic">{req.userId?.name}</h5>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-4 py-1.5 rounded-lg inline-block">
                                                    Target: <span className="text-white">{req.bankName}</span> • <span className="text-white">{req.accountNumber}</span> 
                                                </p>
                                                <p className="text-xl font-black text-emerald-500 tracking-tighter uppercase mt-2">
                                                    Payout: {currency}{req.netAmount.toLocaleString()} <span className="text-[10px] text-slate-600 font-bold italic ml-2">(Fee: {currency}{req.feeCharged})</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleProcessWithdrawal(req._id, 'rejected')}
                                                disabled={processingWithdrawal}
                                                className="px-6 py-4 rounded-2xl bg-slate-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:border-rose-500/20 transition-all active:scale-95"
                                            >
                                                Void Payout
                                            </button>
                                            <button 
                                                onClick={() => handleProcessWithdrawal(req._id, 'approved')}
                                                disabled={processingWithdrawal}
                                                className="px-6 py-4 rounded-2xl bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                            >
                                                Mark as Sent
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-800">
                                    <Banknote size={40} />
                                </div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No pending dividend withdrawals</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Info Message */}
            <div className="bg-slate-950 border border-white/5 rounded-[2.5rem] p-10 flex items-start gap-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-emerald-500 group-hover:scale-110 transition-transform duration-1000">
                    <ShieldCheck size={120} />
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-2xl shrink-0 border border-emerald-500/20 shadow-inner">
                    <ShieldCheck className="text-emerald-500" size={24} />
                </div>
                <div className="space-y-3 relative z-10">
                    <h4 className="font-black text-white text-lg tracking-tight uppercase italic">SuperAdmin Governance Protocol</h4>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest max-w-2xl">
                        Investment exits and dividend withdrawals require explicit verification. Manual "Payout Triggers" should only be used in coordination with your monthly financial audit. 
                        Ensure all bank transfers are confirmed before clicking "Mark as Sent".
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminShareholdersPage;
