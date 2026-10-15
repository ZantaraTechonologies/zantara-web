import React, { useEffect } from 'react';
import {
    ArrowLeft,
    Building2,
    Copy,
    ShieldCheck,
    Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VirtualAccountProvisioningPanel from '../../components/wallet/VirtualAccountProvisioningPanel';
import { useWalletStore } from '../../store/wallet/walletStore';
import { copyToClipboard } from '../../utils/clipboard';
import {
    getVirtualAccountProviderLabel,
    isUsableVirtualAccount,
} from '../../utils/virtualAccounts';

const UserVirtualAccountPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        virtualAccounts = [],
        virtualAccountProviders = {},
        fetchVirtualAccount,
    } = useWalletStore();

    useEffect(() => {
        fetchVirtualAccount();
    }, [fetchVirtualAccount]);

    const usableAccounts = virtualAccounts.filter(isUsableVirtualAccount);
    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-3 bg-surface border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft size={20} className="text-slate-900" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bank Transfer Accounts</h1>
                    <p className="text-slate-500 font-medium text-sm">Manage every provider account linked to your wallet.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                    {usableAccounts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {usableAccounts.map((account, index) => {
                                const providerLabel = getVirtualAccountProviderLabel(account);
                                return (
                                    <div
                                        key={account._id || `${account.provider}-${account.accountNumber}-${index}`}
                                        data-virtual-account-provider={providerLabel.toLowerCase()}
                                        className="relative overflow-hidden rounded-2xl border border-slate-100 bg-surface p-6 shadow-card"
                                    >
                                        <div className="absolute top-0 right-0 w-36 h-36 bg-brand-emerald-100/60 rounded-full blur-[60px] -mr-14 -mt-14" />
                                        <div className="relative z-10 space-y-5">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="w-11 h-11 bg-brand-mint/60 rounded-xl flex items-center justify-center text-brand-emerald border border-brand-emerald/20">
                                                    <Building2 size={22} />
                                                </div>
                                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-700">{providerLabel}</span>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Bank</p>
                                                <p className="mt-1 font-bold text-slate-900">{account.bankName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Account Number</p>
                                                <div className="mt-1 flex items-center justify-between gap-3">
                                                    <p className="break-all text-2xl font-extrabold tracking-[0.08em] text-brand-emerald">{account.accountNumber}</p>
                                                    <button
                                                        type="button"
                                                        aria-label={`Copy ${providerLabel} account number`}
                                                        onClick={() => copyToClipboard(account.accountNumber || '', 'Account number copied to clipboard')}
                                                        className="shrink-0 p-2 text-brand-emerald hover:text-slate-900 transition-colors"
                                                    >
                                                        <Copy size={19} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Account Name</p>
                                                <p className="mt-1 text-sm font-bold text-slate-900">{account.accountName}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-surface p-8 text-center">
                            <Building2 size={36} className="mx-auto text-slate-300" />
                            <h2 className="mt-4 font-bold text-slate-900">No active transfer account</h2>
                            <p className="mt-1 text-xs font-medium text-slate-500">Use the provider-neutral request below to create available accounts.</p>
                        </div>
                    )}

                    <VirtualAccountProvisioningPanel
                        virtualAccounts={virtualAccounts}
                        providers={virtualAccountProviders}
                        showWhenAccountExists
                    />
                </div>

                <div className="space-y-5">
                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex items-start gap-4">
                        <div className="w-11 h-11 bg-surface rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                            <Zap size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Automatic settlement</h3>
                            <p className="mt-1 text-xs text-slate-600 font-medium leading-relaxed">Transfers to any active account shown here are tracked and credited to your wallet.</p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-surface p-5">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={20} className="text-brand-emerald" />
                            <h3 className="font-bold text-slate-900">Request safety</h3>
                        </div>
                        <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">Requests go through Zantara's authenticated backend. Provider credentials are never stored in this browser.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserVirtualAccountPage;
