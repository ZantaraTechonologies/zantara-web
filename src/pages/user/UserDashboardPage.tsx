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
    Bell,
    CreditCard,
    Users,
    Copy,
    Download,
    ShieldAlert,
    Briefcase
} from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';
import { useWalletStore } from '../../store/wallet/walletStore';
import { useEarningsSummary } from '../../hooks/useReferral';
import { Link, useNavigate } from 'react-router-dom';
import { useMyTransactions } from '../../hooks/useWallet';
import { ListSkeleton } from '../../components/feedback/Skeletons';
import { format } from 'date-fns';

const UserDashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const { balance, currency } = useWalletStore();
    const earningsRes = useEarningsSummary();
    const { myReferralCode, totalReferrals, referralBalance } = (earningsRes.data as any) || {};
    const refLoading = earningsRes.isLoading;
    const navigate = useNavigate();

    // Fetch transactions for "Recent Activity"
    const { data: txData, isLoading: txLoading } = useMyTransactions({ limit: 4 });
    const recentActivities = txData?.items ?? [];

    const stats = [
        { label: 'Network Assets', value: `${currency} ${balance?.toLocaleString()}`, icon: LayoutDashboard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Yield Balance', value: `${currency} ${referralBalance?.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Nodes Linked', value: totalReferrals?.toString() || '0', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const quickActions = [
        { label: 'Airtime', icon: Zap, path: '/app/services/airtime', color: 'bg-orange-50 text-orange-600' },
        { label: 'Data', icon: Wifi, path: '/app/services/data', color: 'bg-blue-50 text-blue-600' },
        { label: 'Cable', icon: TV, path: '/app/services/cable', color: 'bg-purple-50 text-purple-600' },
        { label: 'Power', icon: Zap, path: '/app/services/electricity', color: 'bg-yellow-50 text-yellow-600' },
        { label: 'Exam', icon: GraduationCap, path: '/app/services/exam', color: 'bg-red-50 text-red-600' },
        { label: 'Games', icon: Gamepad2, path: '/app/services/betting', color: 'bg-emerald-50 text-emerald-600' },
    ];

    const copyReferralCode = () => {
        if (!myReferralCode) return;
        navigator.clipboard.writeText(myReferralCode);
        alert('Referral code copied to clipboard!');
    };

    const lastCredit = recentActivities.find(tx => tx.type === 'wallet_fund' || tx.amount > 0);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700 font-sans">
            {/* Top Identity Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Protocol Alpha <span className="text-emerald-500">Online</span>
                        </h1>
                        {user?.role === 'agent' ? (
                            <div className="bg-blue-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-blue-900/10">
                                <Briefcase size={12} />
                                Agent Node
                            </div>
                        ) : (
                            <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                Standard Node
                            </div>
                        )}
                    </div>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        Welcome back, <span className="text-slate-900 font-bold">{user?.firstName || 'User'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="relative p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                        <Bell size={20} className="text-slate-600" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <Link to="/app/wallet/fund" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                        <Plus size={18} />
                        <span>Fund Node</span>
                    </Link>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                                <stat.icon size={22} />
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">Live</div>
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
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
                                recentActivities.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">{item.service || item.type}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                    {format(new Date(item.createdAt), 'MMM dd, HH:mm')} • {item.status.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-sm ${item.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                {item.amount > 0 ? '+' : ''}{currency}{Math.abs(item.amount).toLocaleString()}
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-bold tracking-tighter uppercase">Protocol Settlement</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-slate-50 rounded-2xl">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No activities detected on this node</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Analytics */}
                <div className="lg:col-span-4 space-y-8">
                    {/* User Status Card */}
                    <div className="bg-slate-950 rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em]">Account Status</p>
                                    <h4 className="text-lg font-bold flex items-center gap-2">
                                        {user?.kycStatus === 'verified' ? 'Verified Tier' : 'Unverified Node'}
                                        {user?.kycStatus === 'verified' && <ShieldCheck size={18} className="text-emerald-400" />}
                                    </h4>
                                </div>
                                <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center backdrop-blur-md">
                                    <ShieldAlert size={20} className={user?.kycStatus === 'verified' ? 'text-emerald-400' : 'text-slate-400'} />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-slate-500 uppercase flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        Last Credit
                                    </span>
                                    <span className="text-white">{lastCredit ? `${currency}${lastCredit.amount.toLocaleString()}` : 'None'}</span>
                                </div>
                                <Link to="/app/profile/kyc" className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-950 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors uppercase tracking-widest">
                                    Level Details
                                    <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Referral Engine */}
                    <div className="bg-emerald-50 rounded-2xl p-6 space-y-6 border border-emerald-100/50">
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
                                    <code className="text-lg font-black tracking-widest text-slate-900 font-mono">{myReferralCode || '-------'}</code>
                                    <button onClick={copyReferralCode} className="text-emerald-500 hover:text-emerald-600 active:scale-90 transition-transform">
                                        <Copy size={18} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] text-emerald-700/70 font-medium leading-relaxed">
                                Share your code and earn a lifetime commission on every purchase made by nodes assigned to you.
                            </p>
                            <Link to="/app/referral" className="w-full flex items-center justify-center py-3 bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs hover:bg-emerald-600 transition-colors uppercase tracking-widest">
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;
