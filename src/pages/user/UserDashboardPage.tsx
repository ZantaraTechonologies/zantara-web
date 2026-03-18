import React from 'react';
import { 
    Wallet, 
    Zap, 
    Wifi, 
    Tv, 
    GraduationCap, 
    ChevronRight,
    ArrowUpRight,
    Search,
    Bell,
    Settings,
    Plus,
    Clock,
    UserCircle,
    Copy,
    Download,
    ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';
import { useWalletStore } from '../../store/wallet/walletStore';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UserDashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const { balance, currency, fetchBalance } = useWalletStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchBalance();
    }, []);

    const quickActions = [
        { name: 'Buy Airtime', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50', path: '/app/buy/airtime' },
        { name: 'Buy Data', icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-50', path: '/app/buy/data' },
        { name: 'Pay Bills', icon: Tv, color: 'text-emerald-500', bg: 'bg-emerald-50', path: '/app/buy/cable' },
        { name: 'Fund Wallet', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50', path: '/app/wallet/fund' },
    ];

    const activities = [
        { name: 'Airtime Purchase', detail: 'Today, 2:45 PM', amount: '-₦1,000', status: 'SUCCESSFUL', color: 'text-red-500', icon: Zap },
        { name: 'Wallet Funding', detail: 'Today, 10:12 AM', amount: '+₦25,000', status: 'BANK TRANSFER', color: 'text-emerald-500', icon: Plus },
        { name: 'Electricity Bill', detail: 'Yesterday, 6:30 PM', amount: '-₦5,500', status: 'IKEJA ELECTRIC', color: 'text-red-500', icon: Zap },
        { name: 'Data Subscription', detail: '2 days ago', amount: '-₦2,500', status: 'MTN DATA', color: 'text-red-500', icon: Wifi },
    ];

    return (
        <div className="p-2 sm:p-6 lg:p-10 font-['Inter',_sans-serif]">
            {/* Top Toolbar Simulation (Inside Layout usually, but adding for completeness if needed) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Hello {user?.name || 'Alex'}, manage your wallet and bills with ease.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/app/transactions')} className="flex items-center gap-2 bg-white border border-slate-100 px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        <Clock size={18} />
                        <span>Transactions</span>
                    </button>
                    <button onClick={() => navigate('/app/wallet/fund')} className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-slate-950 px-6 py-3 rounded-xl font-extrabold transition-all shadow-lg shadow-emerald-500/20">
                        <Plus size={18} />
                        <span>Fund Wallet</span>
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column - Main Stats */}
                <div className="xl:col-span-8 space-y-8">
                    {/* Hero Balance Card */}
                    <Link to="/app/wallet" className="relative bg-teal-950 rounded-[2.5rem] p-10 overflow-hidden min-h-[320px] flex flex-col justify-between shadow-2xl shadow-emerald-950/20 group block">
                        {/* Abstract Background Design */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-900/40 rounded-full blur-3xl -ml-16 -mb-16"></div>
                        
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="space-y-1">
                                <span className="text-emerald-400/80 font-bold uppercase tracking-[0.2em] text-[10px]">Total Wallet Balance</span>
                                <h2 className="text-6xl font-black text-white tracking-tighter">
                                    {currency} {balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h2>
                            </div>
                            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                                <Wallet className="text-emerald-400 w-6 h-6" />
                            </div>
                        </div>

                        <div className="relative z-10 flex gap-12 text-sm border-t border-white/5 pt-8 mt-8">
                            <div className="space-y-1">
                                <p className="text-white/40 font-bold uppercase tracking-wider text-[9px]">Account Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    <span className="text-white font-bold">Active & Verified</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/40 font-bold uppercase tracking-wider text-[9px]">Last Credit</p>
                                <p className="text-white font-bold">₦25,000.00 <span className="text-white/40 font-medium">(Today)</span></p>
                            </div>
                        </div>
                    </Link>

                    {/* Quick Actions Header */}
                    <div className="pt-4">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {quickActions.map((action, i) => (
                                <button key={i} onClick={() => navigate(action.path)} className="bg-white border border-slate-50 p-6 rounded-3xl flex flex-col items-center gap-4 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all group">
                                    <div className={`${action.bg} ${action.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <action.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{action.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="bg-white p-8 rounded-3xl border border-slate-50 flex items-center gap-6 shadow-sm">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                                <ShieldAlert size={32} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Secure Account</h4>
                                <p className="text-sm text-slate-500 font-medium mt-1">Your KYC is 85% complete.</p>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-50 flex items-center gap-6 shadow-sm">
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                                <Zap size={32} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Instant Payments</h4>
                                <p className="text-sm text-slate-500 font-medium mt-1">All bill payments are instant.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Secondary Stats & Activity */}
                <div className="xl:col-span-4 space-y-8">
                    {/* Referral Earnings Card */}
                    <div className="bg-emerald-400 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-xl shadow-emerald-500/20">
                        {/* Background Decoration */}
                        <div className="absolute bottom-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
                            <div className="w-24 h-24 bg-slate-950 rounded-full blur-2xl"></div>
                        </div>
                        
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-1">
                                <span className="text-slate-950/60 font-bold uppercase tracking-[0.2em] text-[10px]">Referral Earnings</span>
                                <h3 className="text-4xl font-black text-slate-950 tracking-tighter">₦12,450.00</h3>
                                <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-800/80">
                                    <ArrowUpRight size={14} />
                                    <span>+₦3,000 this week</span>
                                </div>
                            </div>
                            <button className="bg-slate-950 text-white px-8 py-3 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-950/20">
                                Withdraw
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-50 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-slate-900">Recent Activity</h3>
                            <button className="text-emerald-500 font-bold text-xs uppercase tracking-widest hover:text-emerald-600 transition-colors">
                                View All
                            </button>
                        </div>

                        <div className="space-y-6">
                            {activities.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                            <item.icon size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.detail}</p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className={`font-black text-sm ${item.color}`}>{item.amount}</p>
                                        <p className="text-[9px] text-slate-400 font-bold tracking-widest">{item.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-10 border-t border-slate-50 pt-8 flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors group">
                            <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                            <span>Download History</span>
                        </button>
                    </div>

                    {/* Referral Link Card */}
                    <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white">
                        <div className="flex items-center justify-between mb-6">
                            <div className="space-y-1">
                                <h4 className="font-bold text-lg leading-tight tracking-tight">Invite & Earn</h4>
                                <p className="text-slate-500 text-xs font-medium">₦500 per friend</p>
                            </div>
                            <button className="bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-colors">
                                <Copy size={12} />
                                <span>Copy Link</span>
                            </button>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-2">
                            <span className="text-[10px] font-mono text-emerald-400/80 truncate">zantara.app/r/alex_2930</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;
