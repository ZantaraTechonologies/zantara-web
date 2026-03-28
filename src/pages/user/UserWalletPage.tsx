import React, { useEffect, useState } from 'react';
import { 
    Wallet, 
    ArrowUpRight, 
    CreditCard, 
    Building2, 
    ChevronRight,
    Plus,
    Info,
    History,
    Lock,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { useWalletStore } from '../../store/wallet/walletStore';
import { Link, useSearchParams } from 'react-router-dom';
import { useMyTransactions } from '../../hooks/useWallet';
import { format } from 'date-fns';
import { CardSkeleton, ListSkeleton } from '../../components/feedback/Skeletons';

const UserWalletPage: React.FC = () => {
    const { 
        balance, // Available
        totalBalance,
        frozenBalance,
        currency, 
        fetchBalance, 
        fetchVirtualAccount, 
        virtualAccount,
        fetchLinkedAccounts,
        linkedAccounts,
        loadingBalance,
    } = useWalletStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const [fundedStatus, setFundedStatus] = useState<'success' | 'failed' | null>(() => {
        const f = searchParams.get('funded');
        if (f === '1') return 'success';
        if (f === '0') return 'failed';
        return null;
    });

    // Remove ?funded param from URL after reading it
    useEffect(() => {
        if (searchParams.has('funded')) {
            searchParams.delete('funded');
            setSearchParams(searchParams, { replace: true });
        }
    }, []);

    // Auto-dismiss toast after 5 seconds
    useEffect(() => {
        if (!fundedStatus) return;
        const t = setTimeout(() => setFundedStatus(null), 5000);
        return () => clearTimeout(t);
    }, [fundedStatus]);

    const { data: txData } = useMyTransactions({ limit: 3 });
    const recentTxs = txData?.items ?? [];

    useEffect(() => {
        fetchBalance();
        fetchVirtualAccount();
        fetchLinkedAccounts();
    }, []);

    const stats = [
        { label: 'Total Balance', amount: `${currency} ${(totalBalance || 0).toLocaleString()}`, icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Frozen Capital', amount: `${currency} ${(frozenBalance || 0).toLocaleString()}`, icon: Lock, color: 'text-red-500', bg: 'bg-red-50' },
    ];

    return (
        <div className="p-4 sm:p-5 lg:p-6 space-y-6 animate-in fade-in duration-700 font-sans">
            {/* Funded Toast */}
            {fundedStatus && (
                <div className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm shadow-lg ${
                    fundedStatus === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {fundedStatus === 'success'
                        ? <CheckCircle2 size={20} className="shrink-0" />
                        : <XCircle size={20} className="shrink-0" />}
                    <span>
                        {fundedStatus === 'success'
                            ? 'Payment successful — your wallet has been credited!'
                            : 'Payment could not be verified. If funds were deducted, contact support.'}
                    </span>
                    <button onClick={() => setFundedStatus(null)} className="ml-auto text-current opacity-50 hover:opacity-100">×</button>
                </div>
            )}
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">My Wallet</h1>
                    <p className="text-slate-500 font-medium text-sm">Manage your funds and financial ecosystem.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/app/wallet/withdraw" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-100 px-5 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm text-sm">
                        <ArrowUpRight size={18} />
                        <span>Withdraw</span>
                    </Link>
                    <Link to="/app/wallet/fund" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 text-sm">
                        <Plus size={18} />
                        <span>Fund Wallet</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Balance & Stats */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Main Balance Card */}
                    {loadingBalance ? (
                        <CardSkeleton />
                    ) : (
                        <div className="relative bg-slate-950 rounded-2xl p-6 overflow-hidden shadow-2xl shadow-slate-900/20 group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800/20 rounded-full blur-[80px] -ml-24 -mb-24"></div>
                            
                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <p className="text-emerald-400/60 font-bold uppercase tracking-[0.2em] text-[10px]">Available Capital</p>
                                        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter">
                                            {currency} {balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </h2>
                                    </div>
                                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 backdrop-blur-sm">
                                        <Wallet className="text-emerald-400 w-6 h-6" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Wallet Status</p>
                                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                                            <div className={`w-2 h-2 rounded-full ${balance > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></div>
                                            <span>{balance > 0 ? 'ACTIVE PROTOCOL' : 'INACTIVE / EMPTY'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Last Updated</p>
                                        <p className="text-white font-bold text-sm">{recentTxs[0] ? format(new Date(recentTxs[0].createdAt), 'MMM dd, HH:mm') : 'No History'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div key={i} className="bg-white border border-slate-50 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                    <div className="space-y-1">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
                                        <h3 className="text-lg font-bold text-slate-900">{stat.amount}</h3>
                                    </div>
                                    <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                                        <Icon size={18} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recent Transactions Preview */}
                    <div className="bg-white border border-slate-50 rounded-2xl p-6 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <History className="text-emerald-500" size={20} />
                                <span>Recent Ledger</span>
                            </h3>
                            <Link to="/app/transactions" className="text-xs font-bold text-emerald-500 uppercase tracking-widest hover:text-emerald-600 transition-colors">
                                Full History
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {txData === undefined ? (
                                <ListSkeleton items={3} />
                            ) : recentTxs.length > 0 ? (
                                recentTxs.map((tx, i) => {
                                    const isCredit = (tx.type === 'wallet_fund') || (tx.amount > 0);
                                    return (
                                        <div key={tx.id ?? i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm xl:text-xs">{tx.service || tx.type || 'Transaction'}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                        Zantara • {new Date(tx.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold text-sm ${isCredit ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {isCredit ? '+' : '-'}{currency}{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-[9px] text-slate-400 font-bold tracking-widest mt-0.5">{(tx.status || 'DONE').toUpperCase()}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed border-slate-50 rounded-2xl">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No transactions yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Virtual Account & Linked Banks */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Virtual Account Detail */}
                    <div className="bg-emerald-50 rounded-2xl p-6 space-y-6 border border-emerald-100/50">
                        <div className="space-y-1">
                            <p className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Virtual Funding Node</p>
                            <h3 className="text-xl font-bold text-slate-900">Direct Transfer</h3>
                        </div>

                        {virtualAccount ? (
                            <div className="space-y-4">
                                <div className="space-y-1 bg-white/60 p-4 rounded-xl border border-white">
                                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Bank Name</p>
                                    <p className="font-bold text-slate-900 text-sm">{virtualAccount.bankName || 'Loading...'}</p>
                                </div>
                                <div className="space-y-1 bg-white/60 p-4 rounded-xl border border-white flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Account Number</p>
                                        <p className="font-bold text-slate-900 text-base tracking-widest">{virtualAccount.accountNumber || 'Generating...'}</p>
                                    </div>
                                    <button className="text-emerald-500 hover:text-emerald-600"><Plus size={16} /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-5 space-y-3">
                                <Building2 className="w-10 h-10 text-emerald-200 mx-auto" />
                                <p className="text-slate-500 text-xs font-medium">Auto-generating your dedicated funding node...</p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-xl">
                            <Info size={14} className="text-emerald-500 shrink-0" />
                            <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                                Funds sent to this account will appear in your wallet instantly.
                            </p>
                        </div>
                    </div>

                    {/* Linked Bank Accounts */}
                    <div className="bg-white border border-slate-50 rounded-2xl p-6 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Building2 className="text-emerald-500" size={18} />
                                <span>Linked Hubs</span>
                            </h3>
                            <Link to="/app/wallet/linked-accounts" className="text-emerald-500"><Plus size={18} /></Link>
                        </div>

                        <div className="space-y-3">
                            {linkedAccounts.length > 0 ? (
                                linkedAccounts.map((acc, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 border border-slate-50 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                                            <Building2 size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 text-xs truncate">{acc.bankName}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{acc.accountNumber.replace(/.(?=.{4})/g, '*')}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300" />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-5 border-2 border-dashed border-slate-50 rounded-xl">
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No accounts linked</p>
                                </div>
                            )}
                        </div>

                        <Link to="/app/wallet/linked-accounts" className="w-full inline-flex items-center justify-center py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors">
                            Manage Accounts
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserWalletPage;
