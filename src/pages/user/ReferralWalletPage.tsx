import React from 'react';
import { useEarningsSummary, useEarningsHistory } from '../../hooks/useReferral';
import { Wallet, TrendingUp, Users, ArrowRight, Receipt, Info, ShieldCheck, AlertCircle, Briefcase } from 'lucide-react';
import { useWalletStore } from '../../store/wallet/walletStore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ReferralWalletPage: React.FC = () => {
    const { data: stats, isLoading: statsLoading } = useEarningsSummary();
    const { data: historyRes, isLoading: historyLoading } = useEarningsHistory(1, 20);
    const { currency } = useWalletStore();

    const historyItems = historyRes?.data || [];
    const isLoading = statsLoading || historyLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Earnings & Rewards</h1>
                    <p className="text-slate-500 font-medium text-sm">Manage your referrals, agent profits, and commissions.</p>
                </div>
                <Link 
                    to="/app/referral"
                    className="text-emerald-600 font-bold text-sm hover:underline"
                >
                    View Program Details
                </Link>
            </div>

            {/* Main Stats and Balance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                    
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Spendable Balance</span>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                            {currency}{stats?.referralBalance?.toLocaleString() || '0'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-50 w-full">
                        <div className="text-center group border-r border-slate-50">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Total Earned</p>
                            <p className="text-xl font-bold text-slate-800">{currency}{stats?.totalEarnings?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="text-center group">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Total Referrals</p>
                            <p className="text-xl font-bold text-slate-800">{stats?.totalReferrals || 0}</p>
                        </div>
                    </div>

                    <Link 
                        to="/app/referral/redeem"
                        className={`flex items-center justify-center gap-2 w-full max-w-md py-4 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
                            !stats?.referralBalance || stats.referralBalance < 100
                            ? 'pointer-events-none bg-slate-100 text-slate-400 shadow-none'
                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                        }`}
                    >
                        Redeem into Main Wallet
                        <ArrowRight size={18} />
                    </Link>

                    {(!stats?.referralBalance || stats.referralBalance < 100) && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <Info size={14} />
                            <span className="text-[11px] font-medium italic">Minimum redemption amount is {currency}100</span>
                        </div>
                    )}
                </div>

                {/* Secondary Transparency Stats */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                <Briefcase size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Agent Level</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Agent Profit</p>
                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">{currency}{stats?.agentProfit?.toLocaleString() || '0'}</h4>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                                <ShieldCheck size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capped (Protected)</p>
                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">{stats?.cappedCommissionsCount || 0} Events</h4>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                <AlertCircle size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skipped (Low Margin)</p>
                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">{stats?.skippedCommissionsCount || 0} Events</h4>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={20} className="text-emerald-500" />
                        <h3 className="text-base font-bold text-slate-900">Earnings Activity</h3>
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {historyItems.length > 0 ? (
                        historyItems.map((item) => (
                            <Link 
                                key={item.id} 
                                to={`/app/transactions/${item.transactionId || item.id}`}
                                className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 ${
                                        item.type === 'referral_bonus' ? 'bg-emerald-50 text-emerald-500' : 
                                        item.type === 'agent_profit' ? 'bg-blue-50 text-blue-500' :
                                        item.type === 'referral_skipped' ? 'bg-slate-50 text-slate-400' :
                                        'bg-slate-950 text-white'
                                    }`}>
                                        <Receipt size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                                            {item.type === 'referral_bonus' ? 'Referral Bonus' : 
                                             item.type === 'agent_profit' ? 'Agent Profit' :
                                             item.type === 'referral_skipped' ? 'Skipped (Low Margin)' :
                                             'Earnings Redemption'}
                                        </p>
                                        <p className="text-slate-400 text-xs mt-0.5">
                                            {format(new Date(item.createdAt), 'MMM dd, yyyy • hh:mm a')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm ${
                                        item.type === 'referral_bonus' || item.type === 'agent_profit' ? 'text-emerald-600' : 
                                        item.type === 'referral_skipped' ? 'text-slate-400' :
                                        'text-slate-900'
                                    }`}>
                                        {item.status === 'skipped' ? '' : item.type === 'referral_redeem' ? '-' : '+'} {currency}{item.amount.toLocaleString()}
                                    </p>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                        item.status === 'success' ? 'text-emerald-500' : 
                                        item.status === 'skipped' ? 'text-slate-300' :
                                        'text-slate-400'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="p-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                <Users size={32} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-400">No activity detected</p>
                                <p className="text-xs text-slate-400 max-w-[200px] mx-auto italic">Your reward activity will appear here once transactions occur.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReferralWalletPage;
