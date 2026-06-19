import React, { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    ArrowUpRight,
    Plus,
    Zap,
    Wifi,
    Tv,
    GraduationCap,
    ChevronRight,
    TrendingUp,
    ShieldAlert,
    Briefcase,
    Share2,
    Bell,
    CreditCard,
    Users,
    Copy,
    Info,
    Wallet,
    Activity,
    X,
    Trophy,
    Building2,
    Megaphone,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';
import { useWalletStore } from '../../store/wallet/walletStore';
import { useEarningsSummary } from '../../hooks/useReferral';
import { Link, useNavigate } from 'react-router-dom';
import { useMyTransactions } from '../../hooks/useWallet';
import { useNotifications } from '../../hooks/useNotifications';
import { ListSkeleton, PageLoader } from '../../components/feedback/Skeletons';
import { format } from 'date-fns';
import { copyToClipboard, shareContent } from '../../utils/clipboard';
import { toast } from 'react-hot-toast';

const DashboardSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between bg-white/50 p-4 rounded-3xl border border-slate-50">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100"></div>
                <div className="space-y-2">
                    <div className="w-40 h-3 bg-slate-100 rounded"></div>
                    <div className="w-28 h-2 bg-slate-50 rounded"></div>
                </div>
            </div>
            <div className="flex gap-3">
                <div className="w-24 h-8 bg-slate-100 rounded-xl"></div>
                <div className="w-28 h-8 bg-emerald-100 rounded-xl"></div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
                <div key={i} className="bg-white border border-slate-50 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
                    <div className="space-y-2">
                        <div className="w-20 h-2 bg-slate-100 rounded"></div>
                        <div className="w-28 h-5 bg-slate-100 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
        <div className="bg-white border border-slate-50 rounded-2xl p-6">
            <div className="w-32 h-3 bg-slate-100 rounded mb-6"></div>
            <ListSkeleton items={4} />
        </div>
    </div>
);

const UserDashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const { 
        balance, 
        frozenBalance,
        currency, 
        fetchBalance,
        fetchVirtualAccount,
        fetchLinkedAccounts,
        generateAccounts,
        virtualAccount
    } = useWalletStore();
    
    const earningsRes = useEarningsSummary();
    const myReferralCode = user?.myReferralCode;
    const { totalReferrals, referralBalance } = (earningsRes.data as any) || {};
    const refLoading = earningsRes.isLoading;
    const navigate = useNavigate();

    // Fetch transactions for "Recent Activity"
    const { data: txData, isLoading: txLoading } = useMyTransactions({ limit: 4 });
    const recentActivities = txData?.items ?? [];

    const [initialLoading, setInitialLoading] = useState(true);

    const { data: notifData } = useNotifications();
    const notifications = Array.isArray(notifData) ? notifData : [];
    // Pick the most recent active broadcast to show as the welcome modal
    const activeBroadcasts = notifications.filter((n: any) => n.isBroadcast);
    const latestBroadcast = activeBroadcasts[0] ?? null;

    const [showBroadcast, setShowBroadcast] = useState(false);
    const [currentBroadcast, setCurrentBroadcast] = useState<any>(null);

    useEffect(() => {
        // Initial data sync
        Promise.all([
            fetchBalance(),
            fetchVirtualAccount(),
            fetchLinkedAccounts()
        ]).finally(() => setInitialLoading(false));
    }, []);

    // Auto-generate virtual accounts if empty
    useEffect(() => {
        if (!initialLoading && (!virtualAccount || Object.keys(virtualAccount).length === 0)) {
            console.log('Silently generating virtual accounts...');
            generateAccounts().catch(err => console.error('Silent VA generation failed:', err));
        }
    }, [initialLoading, !!virtualAccount]);

    // Show broadcast modal every time the dashboard loads (no session gate)
    useEffect(() => {
        if (latestBroadcast) {
            setCurrentBroadcast(latestBroadcast);
            setShowBroadcast(true);
        }
    }, [latestBroadcast?._id]);

    const getBroadcastConfig = (type: string) => {
        switch (type) {
            case 'critical':
                return { headerClass: 'from-red-600 to-red-400', icon: AlertTriangle, badge: 'CRITICAL ALERT', btnClass: 'bg-red-500 hover:bg-red-600' };
            case 'warning':
                return { headerClass: 'from-amber-600 to-amber-400', icon: AlertTriangle, badge: 'IMPORTANT', btnClass: 'bg-amber-500 hover:bg-amber-600' };
            case 'success':
                return { headerClass: 'from-emerald-700 to-emerald-500', icon: CheckCircle2, badge: 'ANNOUNCEMENT', btnClass: 'bg-emerald-600 hover:bg-emerald-700' };
            default:
                return { headerClass: 'from-emerald-800 to-emerald-500', icon: Megaphone, badge: 'BROADCAST', btnClass: 'bg-emerald-600 hover:bg-emerald-700' };
        }
    };

    const handleCloseBroadcast = () => setShowBroadcast(false);

    if (initialLoading) return <DashboardSkeleton />;

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
        <div className="px-4 py-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-700 font-sans relative">

            {/* Broadcast Modal — shows on every dashboard visit */}
            {showBroadcast && currentBroadcast && (() => {
                const cfg = getBroadcastConfig(currentBroadcast.broadcastType || 'info');
                const Icon = cfg.icon;
                return (
                    <div
                        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                        onClick={(e) => { if (e.target === e.currentTarget) handleCloseBroadcast(); }}
                    >
                        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 relative">
                            {/* Dismiss X */}
                            <button
                                onClick={handleCloseBroadcast}
                                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/35 text-white rounded-full transition-colors"
                            >
                                <X size={16} />
                            </button>

                            {/* Colored Header */}
                            <div className={`bg-gradient-to-br ${cfg.headerClass} px-8 pt-10 pb-8 relative overflow-hidden flex flex-col items-center text-center`}>
                                <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

                                {/* Badge */}
                                <div className="relative z-10 flex items-center gap-1.5 bg-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-5">
                                    <Icon size={10} />
                                    {cfg.badge}
                                </div>

                                {/* Icon circle */}
                                <div className="relative z-10 w-20 h-20 rounded-full bg-white/20 border-2 border-white/35 flex items-center justify-center mb-5 shadow-lg">
                                    <Icon size={36} className="text-white" />
                                </div>

                                <h2 className="relative z-10 text-xl font-black text-white tracking-tight leading-tight">{currentBroadcast.title}</h2>
                            </div>

                            {/* Body */}
                            <div className="px-8 py-7 space-y-6">
                                <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">{currentBroadcast.message}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">From Zantara</p>
                                    <button
                                        onClick={handleCloseBroadcast}
                                        className={`${cfg.btnClass} text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-colors shadow-md active:scale-95`}
                                    >
                                        Got it!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

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
                    <Link to="/app/wallet/withdraw" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-95 text-xs">
                        <ArrowUpRight size={14} />
                        <span>Withdraw</span>
                    </Link>
                    <Link to="/app/wallet/fund" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-xs">
                        <Plus size={14} />
                        <span>Fund Node</span>
                    </Link>
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
                    {/* Virtual Account Banner (Pro-Tip) */}
                    {virtualAccount && (
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex items-center justify-between group hover:border-emerald-200 transition-all shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Instant Funding Account</p>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-base font-bold text-slate-900 tracking-tight">{virtualAccount.bankName}</h3>
                                        <span className="text-slate-300">•</span>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm font-bold text-slate-600 tracking-widest">{virtualAccount.accountNumber}</code>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    copyToClipboard(virtualAccount.accountNumber, 'Account number copied!');
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Link 
                                to="/app/wallet/virtual-account" 
                                className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-colors"
                            >
                                <span>Details</span>
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    )}

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

                        <div className="space-y-3">
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
                                            className="w-full flex items-center justify-between group p-4 hover:bg-slate-50 rounded-2xl transition-all text-left border border-slate-50 hover:border-slate-200"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
                                                    isSuccess ? 'bg-emerald-500 text-white' : 
                                                    isFailed ? 'bg-rose-500 text-white' : 
                                                    isPending ? 'bg-amber-500 text-white' :
                                                    'bg-slate-400 text-white'
                                                }`}>
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{item.service || item.type.replace('_', ' ').toUpperCase()}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">
                                                            {item.createdAt ? format(new Date(item.createdAt), 'MMM dd, HH:mm') : 'N/A'}
                                                        </p>
                                                        <span className="text-slate-200 text-[8px]">•</span>
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest border ${
                                                            isSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                                            isFailed ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                                                            'bg-amber-50 border-amber-100 text-amber-600'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-4">
                                                <div>
                                                    <p className={`font-black text-sm tracking-tight ${item.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                        {item.amount > 0 ? '+' : ''}{currency}{Math.abs(item.amount).toLocaleString()}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-bold tracking-tighter uppercase mt-0.5">Settlement Result</p>
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
