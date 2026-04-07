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
    Clock
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
            onSuccess: (res: any) => toast.success(res.data.message),
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

    if (overviewLoading) return <div className="p-10"><ListSkeleton count={5} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Shareholder Governance</h1>
                    <p className="text-slate-500 text-xs font-black tracking-[0.2em] mt-1 uppercase">Strategic investment management & dividend oversight</p>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={handleTriggerPayout}
                        disabled={triggeringPayout}
                        className="bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={triggeringPayout ? 'animate-spin' : ''} />
                        Trigger Manual Payout
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] shadow-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Shareholders</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-black text-white">{overview?.totalShareholders || 0}</h4>
                        <Users className="text-emerald-500/20" size={32} />
                    </div>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] shadow-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Shares Issued</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-black text-white">{overview?.totalSharesIssued || 0}</h4>
                        <PieChart className="text-blue-500/20" size={32} />
                    </div>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] shadow-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Dividends Paid</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-black text-white">{currency}{(overview?.totalDividendsPaid || 0).toLocaleString()}</h4>
                        <Banknote className="text-amber-500/20" size={32} />
                    </div>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] shadow-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Profit Allocation</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-black text-white text-emerald-500">{overview?.settings?.investorAllocationPercent || 20}%</h4>
                        <TrendingUp className="text-emerald-500/20" size={32} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 gap-8">
                {[
                    { id: 'overview', label: 'Shareholder Directory', icon: Users },
                    { id: 'exits', label: 'Pending Exits', count: overview?.pendingExitRequests, icon: LogOut },
                    { id: 'withdrawals', label: 'Dividend Withdrawals', count: overview?.pendingWithdrawals, icon: Banknote }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                        {tab.count > 0 && <span className="absolute -top-1 -right-4 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">{tab.count}</span>}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-400 rounded-t-full"></div>}
                    </button>
                ))}
            </div>

            {/* Content Areas */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
                {activeTab === 'overview' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Investor Entity</th>
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Holdings</th>
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ledger Balances</th>
                                    <th className="py-5 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Acquisition Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {shareholdersRes?.data?.map((user: any) => (
                                    <tr key={user._id} className="group hover:bg-white/5 transition-all">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-emerald-500/20 flex items-center justify-center font-black text-xs text-emerald-400">
                                                    {user.name?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white tracking-tight">{user.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-emerald-500">{user.sharesOwned} Shares</p>
                                                {user.frozenShares > 0 && <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest italic">{user.frozenShares} Locked in exit</p>}
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-white">Wallet: {currency}{user.dividendBalance.toLocaleString()}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Total Earned: {currency}{user.totalDividendsEarned.toLocaleString()}</p>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <p className="text-xs font-medium text-slate-400">{user.firstSharePurchasedAt ? format(new Date(user.firstSharePurchasedAt), 'MMM dd, yyyy') : 'N/A'}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'exits' && (
                    <div className="p-8">
                        {pendingExits?.length > 0 ? (
                            <div className="space-y-4">
                                {pendingExits.map((req: any) => (
                                    <div key={req._id} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-amber-500/30 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                                <LogOut size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <h5 className="font-black text-white text-lg tracking-tight">{req.userId?.name}</h5>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <span>Requested Exit: <span className="text-white">{req.sharesRequested} Shares</span></span>
                                                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                                    <span>Net Principal: <span className="text-white">{currency}{req.netAmount.toLocaleString()}</span></span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Clock size={12} className="text-amber-500" />
                                                    <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-tighter">Lock Expired: {format(new Date(req.lockExpiresAt), 'MMM dd, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleProcessExit(req._id, 'rejected')}
                                                disabled={processingExit}
                                                className="px-6 py-3 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                                            >
                                                Reject Request
                                            </button>
                                            <button 
                                                onClick={() => handleProcessExit(req._id, 'approved')}
                                                disabled={processingExit}
                                                className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                            >
                                                Authorize Principal Return
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
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No pending exit requests</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'withdrawals' && (
                    <div className="p-8">
                        {pendingWithdrawals?.length > 0 ? (
                            <div className="space-y-4">
                                {pendingWithdrawals.map((req: any) => (
                                    <div key={req._id} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-emerald-500/30 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                                <Banknote size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <h5 className="font-black text-white text-lg tracking-tight">{req.userId?.name}</h5>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    Bank: <span className="text-white">{req.bankName}</span> • <span className="text-white">{req.accountNumber}</span> 
                                                </p>
                                                <p className="text-sm font-black text-emerald-500 uppercase tracking-tighter mt-1">
                                                    Payout: {currency}{req.netAmount.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold italic ml-2">(Fee: {currency}{req.feeCharged})</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleProcessWithdrawal(req._id, 'rejected')}
                                                disabled={processingWithdrawal}
                                                className="px-6 py-3 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                            >
                                                Reject Payout
                                            </button>
                                            <button 
                                                onClick={() => handleProcessWithdrawal(req._id, 'approved')}
                                                disabled={processingWithdrawal}
                                                className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
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
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No pending dividend withdrawals</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Info Message */}
            <div className="bg-slate-950 border border-white/5 rounded-[2rem] p-6 flex items-start gap-4 shadow-2xl">
                <div className="p-3 bg-emerald-500/10 rounded-2xl shrink-0">
                    <ShieldCheck className="text-emerald-500" size={20} />
                </div>
                <div className="space-y-1">
                    <h4 className="font-black text-white text-sm tracking-tight uppercase">SuperAdmin Protocol</h4>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
                        Exits and withdrawals require explicit authorization. Manual payouts should only be triggered in coordination with the monthly finance audit. 
                        Ensure all bank transfers are confirmed before marking as "Approved".
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminShareholdersPage;
