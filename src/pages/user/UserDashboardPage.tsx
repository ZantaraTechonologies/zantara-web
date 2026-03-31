import React, { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    ArrowUpRight,
    Plus,
    Zap,
    Wifi,
    Tv,
    GraduationCap,
    Gamepad2,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    ShieldAlert,
    Briefcase,
    Share2,
    Bell,
    CreditCard,
    Users,
    Copy,
    Building2,
    Info,
    Wallet,
    Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';
import { useWalletStore } from '../../store/wallet/walletStore';
import { useEarningsSummary } from '../../hooks/useReferral';
import { Link, useNavigate } from 'react-router-dom';
import { useMyTransactions } from '../../hooks/useWallet';
import { ListSkeleton } from '../../components/feedback/Skeletons';
import { format } from 'date-fns';
import { copyToClipboard, shareContent } from '../../utils/clipboard';
import { toast } from 'react-hot-toast';

const UserDashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const { 
        balance, 
        frozenBalance,
        currency, 
        fetchBalance,
        fetchVirtualAccount,
        fetchLinkedAccounts
    } = useWalletStore();
    
    const earningsRes = useEarningsSummary();
    const myReferralCode = user?.myReferralCode;
    const { totalReferrals, referralBalance } = (earningsRes.data as any) || {};
    const refLoading = earningsRes.isLoading;
    const navigate = useNavigate();

    // Fetch transactions for "Recent Activity"
    const { data: txData, isLoading: txLoading } = useMyTransactions({ limit: 4 });
    const recentActivities = txData?.items ?? [];

    useEffect(() => {
        // Initial data sync
        fetchBalance();
        fetchVirtualAccount();
        fetchLinkedAccounts();
    }, []);

    const stats = [
        { label: 'Network Assets', value: `${currency} ${balance?.toLocaleString()}`, icon: LayoutDashboard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Frozen Capital', value: `${currency} ${frozenBalance?.toLocaleString() || '0'}`, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
        { label: 'Yield Balance', value: `${currency} ${referralBalance?.toLocaleString() || '0'}`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    const quickActions = [
        { label: 'Airtime', icon: Zap, path: '/app/services/airtime', color: 'bg-orange-50 text-orange-600' },
        { label: 'Data', icon: Wifi, path: '/app/services/data', color: 'bg-blue-50 text-blue-600' },
        { label: 'Cable', icon: Tv, path: '/app/services/cable', color: 'bg-purple-50 text-purple-600' },
        { label: 'Power', icon: Zap, path: '/app/services/electricity', color: 'bg-yellow-50 text-yellow-600' },
        { label: 'Exam', icon: GraduationCap, path: '/app/services/exam-pins', color: 'bg-red-50 text-red-600' },
        { label: 'History', icon: CreditCard, path: '/app/transactions', color: 'bg-emerald-50 text-emerald-600' },
    ];

    const copyReferralCode = () => {
        if (!myReferralCode) return;
        copyToClipboard(myReferralCode, 'Referral code copied!');
    };

    const handleShare = () => {
        if (!myReferralCode) return;
        shareContent({
            title: 'Join Zantara',
            text: `Join me on Zantara and start earning! Use my code: ${myReferralCode}`,
            url: `${window.location.origin}/register?ref=${myReferralCode}`
        });
    };

    const lastCredit = recentActivities.find(tx => tx.type === 'wallet_fund' || tx.amount > 0);

    return (
        <div className="px-4 py-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-700 font-sans">
            {/* Top Identity Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-slate-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shrink-0">
                        {user?.name?.substring(0, 2).toUpperCase() || 'AZ'}
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
                            System Online: Hello, <span className="text-slate-900 font-bold">{user?.name || 'User'}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg border ${user?.kycStatus === 'verified' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                {user?.kycStatus === 'verified' ? 'Verified Tier' : 'Unverified Node'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">ID: {user?.email?.split('@')[0]}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button disabled className="flex items-center gap-2 bg-white border border-slate-200 text-slate-300 px-4 py-2 rounded-xl font-bold transition-all shadow-sm cursor-not-allowed opacity-60 text-xs">
                        <ArrowUpRight size={14} />
                        <span>Withdraw</span>
                    </button>
                    <button disabled className="flex items-center gap-2 bg-emerald-300 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg cursor-not-allowed opacity-80 text-xs">
                        <Plus size={14} />
                        <span>Fund Node</span>
                    </button>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-50 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
                        <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform shrink-0`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-0.5">{stat.label}</p>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Primary Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Action Grid */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                                <Zap className="text-emerald-500" size={20} />
                                <span>Service Deployment</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                            {quickActions.map((action, i) => (
                                <Link
                                    key={i}
                                    to={action.path}
                                    className="flex flex-col items-center gap-3 group active:scale-95 transition-transform"
                                >
                                    <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-all border border-white/50 backdrop-blur-sm`}>
                                        <action.icon size={24} />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Ledger Preview */}
                    <section className="bg-white border border-slate-50 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                                <CreditCard className="text-emerald-500" size={20} />
                                <span>Recent Ledger</span>
                            </h2>
                            <Link to="/app/transactions" className="text-xs font-bold text-emerald-500 uppercase tracking-widest hover:text-emerald-600 transition-colors">Full History</Link>
                        </div>

                        <div className="space-y-4">
                            {txLoading ? (
                                <ListSkeleton items={4} />
                            ) : recentActivities.length > 0 ? (
                                recentActivities.map((item, idx) => {
                                    const isSuccess = item.status?.toLowerCase() === 'success' || item.status?.toLowerCase() === 'completed';
                                    const isFailed = item.status?.toLowerCase() === 'failed' || item.status?.toLowerCase() === 'error';
                                    const isPending = item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'processing';

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => navigate(`/app/transactions/${item.id}`)}
                                            className="w-full flex items-center justify-between group p-3 hover:bg-slate-50 rounded-xl transition-all text-left border border-transparent hover:border-slate-100"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                                    isSuccess ? 'bg-emerald-50 text-emerald-500' : 
                                                    isFailed ? 'bg-red-50 text-red-500' : 
                                                    'bg-slate-50 text-slate-400'
                                                }`}>
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{item.service || item.type.replace('_', ' ').toUpperCase()}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">
                                                            {item.createdAt ? format(new Date(item.createdAt), 'MMM dd, HH:mm') : 'N/A'}
                                                        </p>
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                                                            isSuccess ? 'bg-emerald-100 text-emerald-700' : 
                                                            isFailed ? 'bg-red-100 text-red-700' : 
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-4">
                                                <div>
                                                    <p className={`font-bold text-sm ${item.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                        {item.amount > 0 ? '+' : ''}{currency}{Math.abs(item.amount).toLocaleString()}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-bold tracking-tighter uppercase">Protocol Settlement</p>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-slate-50 rounded-2xl">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No activities detected on this node</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Analytics & Status */}
                <div className="lg:col-span-4 space-y-8">
                    {/* (Account status moved to header) */}

                    {/* Referral Engine */}
                    <div className="bg-slate-50 rounded-2xl p-6 space-y-6 border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">Network Growth</p>
                                <h3 className="text-xl font-bold text-slate-900">Refer & Earn</h3>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-2xl border border-emerald-100 flex items-center justify-center shadow-sm">
                                <Users size={20} className="text-emerald-500" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 bg-white rounded-xl border border-emerald-100/50 space-y-2">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Your Referral ID</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-lg font-bold tracking-widest text-slate-900 font-mono">{myReferralCode || '-------'}</code>
                                    <div className="flex items-center gap-2">
                                        <button onClick={copyReferralCode} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg active:scale-90 transition-all" title="Copy Code">
                                            <Copy size={18} />
                                        </button>
                                        <button onClick={handleShare} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg active:scale-90 transition-all" title="Share Link">
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-emerald-700/70 font-medium leading-relaxed">
                                Share your code and earn a lifetime commission on every purchase made by nodes assigned to you.
                            </p>
                            <Link to="/app/referral" className="w-full flex items-center justify-center py-3 bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs hover:bg-emerald-600 transition-colors uppercase tracking-widest shadow-sm shadow-emerald-500/10">
                                View Network
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;
