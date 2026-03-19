import React from 'react';
import { useReferralData } from '../../hooks/useReferral';
import { useMyTransactions } from '../../hooks/useWallet';
import { Wallet, TrendingUp, Users, ArrowRight, Receipt, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ReferralWalletPage: React.FC = () => {
    const { data: stats, isLoading: statsLoading } = useReferralData();
    const { data: transactions, isLoading: txLoading } = useMyTransactions();

    // Filter for referral related transactions
    const referralActivities = (transactions as any)?.filter?.((tx: any) => 
        tx.type === 'referral_bonus' || tx.type === 'referral_redeem'
    ) || [];

    const isLoading = statsLoading || txLoading;

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
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Referral Wallet</h1>
                    <p className="text-slate-500 font-medium text-sm">Manage and redeem your referral commissions.</p>
                </div>
                <Link 
                    to="/app/referral"
                    className="text-emerald-600 font-bold text-sm hover:underline"
                >
                    View Program Details
                </Link>
            </div>

            {/* Balance Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Referral Balance</span>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                        ₦{stats?.referralBalance?.toLocaleString() || '0'}
                    </h2>
                </div>

                <div className="flex items-center gap-12 py-6 border-y border-slate-50 w-full justify-center">
                    <div className="text-center">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Earned</p>
                        <p className="text-lg font-bold text-slate-800">₦{stats?.totalReferralBonus?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100"></div>
                    <div className="text-center">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Referrals</p>
                        <p className="text-lg font-bold text-slate-800">{stats?.totalReferrals || 0}</p>
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
                        <span className="text-[11px] font-medium italic">Minimum redemption amount is ₦100</span>
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={20} className="text-emerald-500" />
                        <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {referralActivities.length > 0 ? (
                        referralActivities.map((tx) => (
                            <Link 
                                key={tx.id} 
                                to={`/app/transactions/${tx.id}`}
                                className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 ${
                                        tx.type === 'referral_bonus' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-950 text-white'
                                    }`}>
                                        <Receipt size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                                            {tx.type === 'referral_bonus' ? 'Referral Bonus' : 'Earnings Redemption'}
                                        </p>
                                        <p className="text-slate-400 text-xs mt-0.5">
                                            {format(new Date(tx.createdAt), 'MMM dd, yyyy • hh:mm a')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm ${tx.type === 'referral_bonus' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {tx.type === 'referral_bonus' ? '+' : '-'} ₦{tx.amount.toLocaleString()}
                                    </p>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tx.status}</span>
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
                                <p className="text-xs text-slate-400 max-w-[200px] mx-auto italic">Your referral rewards and redemptions will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReferralWalletPage;
