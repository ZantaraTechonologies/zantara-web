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
        <div className="flex items-center justify-between bg-white/50 p-4 rounded-3xl border border-slate-50 dark:bg-surface/50 dark:border-slate-800/40">
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
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface border border-slate-50 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
                    <div className="space-y-2">
                        <div className="w-20 h-2 bg-slate-100 rounded"></div>
                        <div className="w-28 h-5 bg-slate-100 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
        <div className="bg-surface border border-slate-50 rounded-2xl p-6">
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
    const activeBroadcasts = notifications.filter((n: any) => n.isBroadcast);

    const [showBroadcast, setShowBroadcast] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

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

    // Show broadcast modal when we have active broadcasts (runs once when notifications load/change)
    useEffect(() => {
        if (activeBroadcasts.length > 0) {
            setActiveIndex(0);
            setShowBroadcast(true);
        }
    }, [activeBroadcasts.map((b: any) => b._id).join(',')]);

    const currentBroadcast = activeBroadcasts[activeIndex] ?? null;

    const getBroadcastConfig = (type: string) => {
        switch (type) {
            case 'critical':
                return {
                    headerBg: 'bg-[#E05454]',
                    badgeClass: 'bg-[#d94444] text-white',
                    icon: AlertTriangle,
                    iconColor: 'text-white',
                    badge: 'CRITICAL ALERT',
                    btnClass: 'bg-[#E05454] hover:bg-[#d94444] focus:ring-red-300',
                    accentDot: 'bg-[#E05454]',
                };
            case 'warning':
                return {
                    headerBg: 'bg-amber-500',
                    badgeClass: 'bg-amber-400 text-white',
                    icon: AlertTriangle,
                    iconColor: 'text-white',
                    badge: 'IMPORTANT UPDATE',
                    btnClass: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300',
                    accentDot: 'bg-amber-500',
                };
            case 'success':
                return {
                    headerBg: 'bg-emerald-600',
                    badgeClass: 'bg-emerald-500 text-white',
                    icon: CheckCircle2,
                    iconColor: 'text-white',
                    badge: 'SUCCESS/PROMO',
                    btnClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300',
                    accentDot: 'bg-emerald-600',
                };
            default:
                return {
                    headerBg: 'bg-[#136A63]',
                    badgeClass: 'bg-[#0f5950] text-white',
                    icon: Megaphone,
                    iconColor: 'text-white',
                    badge: 'ANNOUNCEMENT',
                    btnClass: 'bg-[#136A63] hover:bg-[#0f5950] focus:ring-emerald-300',
                    accentDot: 'bg-[#136A63]',
                };
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
                const isLast = activeIndex === activeBroadcasts.length - 1;
                return (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                        onClick={(e) => { if (e.target === e.currentTarget) handleCloseBroadcast(); }}
                    >
                        <div className="bg-surface rounded-3xl w-full max-w-md h-[240px] flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 relative">
                            {/* Dismiss X */}
                            <button
                                onClick={handleCloseBroadcast}
                                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors focus:outline-none"
                            >
                                <X size={16} />
                            </button>

                            {/* Solid Coloured Header */}
                            <div className={`${cfg.headerBg} px-6 pt-6 pb-5 flex flex-col items-center text-center shrink-0`}>
                                {/* Badge */}
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] mb-4 ${cfg.badgeClass}`}>
                                    <Icon size={10} className={cfg.iconColor} />
                                    {cfg.badge}
                                </div>
                                <h2 className="text-xl font-bold text-white tracking-tight leading-tight">{currentBroadcast.title}</h2>
                            </div>

                            {/* Body — flex-1 so it fills remaining height, footer always at bottom */}
                            <div className="flex-1 flex flex-col justify-between px-6 py-5 min-h-0">
                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto flex-1 min-h-0 pr-1">{currentBroadcast.message}</p>

                                <div className="flex items-center justify-between pt-4 shrink-0">
                                    {/* Pagination Dots */}
                                    <div className="flex items-center gap-1.5">
                                        {activeBroadcasts.length > 1 && activeBroadcasts.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveIndex(i)}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? `w-5 ${cfg.accentDot}` : 'w-1.5 bg-slate-300 hover:bg-slate-400'}`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (!isLast) {
                                                setActiveIndex(prev => prev + 1);
                                            } else {
                                                handleCloseBroadcast();
                                            }
                                        }}
                                        className={`${cfg.btnClass} text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md focus:outline-none focus:ring-2`}
                                    >
                                        {isLast ? 'Got it!' : 'Next →'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Top Identity Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-slate-50 shadow-sm dark:bg-surface/50 dark:border-slate-800/40">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-navy flex items-center justify-center text-white font-black text-xs shrink-0">
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
                    <Link to="/app/wallet/withdraw" className="flex items-center gap-2 bg-surface border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all shadow-sm active:scale-95 text-xs">
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
                    <div key={i} className="bg-surface border border-slate-50 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Primary Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Virtual Account Banner (Pro-Tip) */}
                    {virtualAccount && (
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex items-center justify-between group hover:border-emerald-200 transition-all shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-surface rounded-2xl border border-slate-100 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
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
                    <section className="bg-surface border border-slate-50 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                                <CreditCard className="text-emerald-500" size={20} />
                                <span>Recent Ledger</span>
                            </h2>
                            <Link to="/app/transactions" className="text-xs font-bold text-emerald-500 uppercase tracking-widest hover:text-emerald-600 transition-colors">Full History</Link>
                        </div>

                        <div className="-mx-6 overflow-x-auto">
                            {txLoading ? (
                                <ListSkeleton items={4} />
                            ) : recentActivities.length > 0 ? (
                                <table className="w-full text-left border-collapse min-w-[560px]">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100">
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Service</th>
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Date</th>
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Amount</th>
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentActivities.map((item, idx) => {
                                            const isSuccess = item.status?.toLowerCase() === 'success' || item.status?.toLowerCase() === 'completed';
                                            const isFailed = item.status?.toLowerCase() === 'failed' || item.status?.toLowerCase() === 'error';
                                            const isPending = item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'processing';

                                            return (
                                                <tr
                                                    key={idx}
                                                    onClick={() => navigate(`/app/transactions/${item.id}`)}
                                                    className="cursor-pointer transition-colors hover:bg-slate-50/60"
                                                >
                                                    <td className="px-6 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${isSuccess ? 'bg-brand-emerald' :
                                                                isFailed ? 'bg-rose-500' :
                                                                    isPending ? 'bg-amber-500' :
                                                                        'bg-slate-400'
                                                                }`}>
                                                                <CreditCard size={14} />
                                                            </div>
                                                            <span className="font-bold text-slate-900 text-xs">{item.service || item.type.replace('_', ' ').toUpperCase()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3.5 text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                                        {item.createdAt ? format(new Date(item.createdAt), 'MMM dd, HH:mm') : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest border ${isSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                            isFailed ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                                                'bg-amber-50 border-amber-100 text-amber-600'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-3.5 text-right font-black text-sm tracking-tight ${item.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                        {item.amount > 0 ? '+' : ''}{currency}{Math.abs(item.amount).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-right">
                                                        <ChevronRight size={14} className="text-slate-300 inline group-hover:text-slate-500" />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-slate-50 rounded-2xl">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No activities detected on this node</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Analytics & Status */}
                <div className="lg:col-span-4 space-y-6">
                    {/* (Account status moved to header) */}

                    {/* Referral Engine */}
                    <div className="bg-slate-50 rounded-2xl p-6 space-y-6 border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">Network Growth</p>
                                <h3 className="text-xl font-bold text-slate-900">Refer & Earn</h3>
                            </div>
                            <div className="w-12 h-12 bg-surface rounded-2xl border border-emerald-100 flex items-center justify-center shadow-sm">
                                <Users size={20} className="text-emerald-500" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 bg-surface rounded-xl border border-emerald-100/50 space-y-2">
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
                            <Link to="/app/referral" className="w-full flex items-center justify-center py-3 bg-brand-emerald text-white rounded-xl font-bold text-xs hover:bg-brand-emerald-600 transition-colors uppercase tracking-widest shadow-btn">
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
