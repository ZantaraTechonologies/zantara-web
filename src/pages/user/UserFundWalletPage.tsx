import React, { useState } from 'react';
import {
    CreditCard,
    Building2,
    ArrowLeft,
    CheckCircle2,
    Copy,
    ShieldCheck,
    Smartphone,
    Clock3,
    CircleAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../../store/wallet/walletStore';
import * as walletService from '../../services/wallet/walletService';
import type { FundingMethod } from '../../services/wallet/walletService';
import { toast } from 'react-hot-toast';
import { copyToClipboard } from '../../utils/clipboard';
import VirtualAccountProvisioningPanel from '../../components/wallet/VirtualAccountProvisioningPanel';
import {
    getVirtualAccountProviderLabel,
    isFailedVirtualAccount,
    isPendingVirtualAccount,
    isUsableVirtualAccount,
} from '../../utils/virtualAccounts';

const UserFundWalletPage: React.FC = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<'bank' | 'card' | 'ussd' | null>(null);
    const [amount, setAmount] = useState('');
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [availableChannels, setAvailableChannels] = useState<Set<string>>(new Set());
    const [fundingMethods, setFundingMethods] = useState<FundingMethod[] | null>(null);
    const { virtualAccounts = [], fetchVirtualAccount, currency } = useWalletStore();

    React.useEffect(() => {
        fetchVirtualAccount();
        walletService.getFundingMethods()
            .then((methods) => {
                setFundingMethods(methods || []);
                const set = new Set<string>();
                (methods || []).forEach((m) => (m.supportedChannels || []).forEach((c) => set.add(c)));
                setAvailableChannels(set);
            })
            .catch(() => {
                setFundingMethods([]);
                // Funding-methods lookup failed — fall back to Bank Transfer + Card, hide USSD.
            });
    }, []);

    const channelsKnown = availableChannels.size > 0;
    const showCard = !channelsKnown || availableChannels.has('card');
    const showUssd = channelsKnown && availableChannels.has('ussd');
    const isBankTransfer = selected === 'bank';
    const usableAccounts = virtualAccounts.filter(isUsableVirtualAccount);
    const pendingAccounts = virtualAccounts.filter(isPendingVirtualAccount);
    const failedAccounts = virtualAccounts.filter(isFailedVirtualAccount);

    const methods = [
        {
            id: 'bank' as const,
            name: 'Bank Transfer',
            desc: 'Transfer to your permanent Zantara account',
            icon: Building2,
            badge: 'Free'
        },
        ...(showCard ? [{
            id: 'card' as const,
            name: 'Debit Card',
            desc: 'Pay securely with your card',
            icon: CreditCard,
            badge: 'Instant'
        }] : []),
        ...(showUssd ? [{
            id: 'ussd' as const,
            name: 'USSD',
            desc: "Pay using your bank's USSD service",
            icon: Smartphone,
            badge: 'Mobile'
        }] : [])
    ];

    const handlePayment = async () => {
        if (isBankTransfer) return;
        try {
            setLoadingPayment(true);
            const val = Number(amount);
            if (!val || val <= 0) {
                toast.error('Enter an amount to continue');
                setLoadingPayment(false);
                return;
            }
            const channel = selected === 'ussd' ? 'ussd' : 'card';
            // No callback_url override: the backend derives the gateway-specific
            // return URL (CLIENT_BASE_URL/<gateway>/return), exactly as it does
            // for mobile. The shared PaymentReturnPage handles the Zantara-side
            // verification on return regardless of gateway.
            const data = await walletService.initWalletFunding(val, channel);

            if (data?.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                throw new Error('No authorization URL received');
            }
        } catch {
            console.error('Payment initialization failed');
            alert('Failed to initialize payment. Please try again.');
            setLoadingPayment(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-5 lg:p-6 space-y-6 animate-in slide-in-from-bottom-8 duration-700 font-sans">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-3 bg-surface border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft size={18} className="text-slate-900" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fund Wallet</h1>
                    <p className="text-slate-500 font-medium text-sm">Choose a payment method — we handle the gateway securely.</p>
                </div>
            </div>

            {/* Method Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {methods.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setSelected(m.id)}
                        className={`flex items-start gap-4 p-5 sm:p-6 rounded-2xl border-2 transition-all group text-left ${selected === m.id ? 'border-brand-emerald bg-emerald-50/50 shadow-xl shadow-emerald-500/10' : 'border-slate-50 bg-surface hover:border-slate-100'}`}
                    >
                        <div className={`p-3 rounded-xl transition-colors shrink-0 ${selected === m.id ? 'bg-brand-emerald text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                            <m.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-base">{m.name}</h3>
                                <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md">{m.badge}</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{m.desc}</p>
                            <div className={`mt-3 w-6 h-6 rounded-full border-[3px] transition-all flex items-center justify-center ${selected === m.id ? 'border-brand-emerald bg-brand-emerald' : 'border-slate-100 bg-surface'}`}>
                                {selected === m.id && <CheckCircle2 size={13} className="text-white" />}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Panel: Bank Transfer → permanent virtual account */}
            {selected === 'bank' && (
                <div className="bg-surface border border-slate-50 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-brand-emerald border border-brand-emerald/20 shrink-0">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Your Permanent Bank Transfer Account</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Transfer any amount from your bank app — your wallet is credited automatically.</p>
                        </div>
                    </div>

                    {usableAccounts.length > 0 ? (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {usableAccounts.map((account, index) => {
                                    const providerLabel = getVirtualAccountProviderLabel(account);
                                    return (
                                        <div
                                            key={account._id || `${account.provider || 'monnify'}-${account.accountNumber}-${index}`}
                                            data-virtual-account-provider={providerLabel.toLowerCase()}
                                            className="rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{providerLabel}</p>
                                                    <p className="font-bold text-slate-900 mt-0.5">{account.bankName}</p>
                                                </div>
                                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-700">Active</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Number</p>
                                                    <p className="text-xl sm:text-2xl font-extrabold tracking-[0.08em] text-brand-emerald mt-0.5 break-all">{account.accountNumber}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    aria-label={`Copy ${providerLabel} account number`}
                                                    onClick={() => copyToClipboard(account.accountNumber || '', 'Account number copied to clipboard')}
                                                    className="text-brand-emerald hover:text-slate-900 transition-colors p-2 shrink-0"
                                                >
                                                    <Copy size={20} />
                                                </button>
                                            </div>
                                            <div className="px-5 py-4">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Name</p>
                                                <p className="font-bold text-slate-900 mt-0.5">{account.accountName}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {(pendingAccounts.length > 0 || failedAccounts.length > 0) && (
                                <div className="space-y-3">
                                    {pendingAccounts.map((account, index) => (
                                        <div key={account._id || `pending-${index}`} className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                                            <Clock3 size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-amber-900">{getVirtualAccountProviderLabel(account)} account setup in progress</p>
                                                <p className="text-xs text-amber-700 font-medium mt-1">We will show the account details here when they are ready.</p>
                                            </div>
                                        </div>
                                    ))}
                                    {failedAccounts.map((account, index) => (
                                        <div key={account._id || `failed-${index}`} className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
                                            <CircleAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-rose-900">{getVirtualAccountProviderLabel(account)} account unavailable</p>
                                                <p className="text-xs text-rose-700 font-medium mt-1">Account setup could not be completed. Please contact support if this continues.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                                <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-emerald-800">Automatic credit — no confirmation needed</p>
                                    <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                                        Payments sent to this account are tracked and credited to your Zantara wallet automatically. No amount limits.
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 font-medium">
                                Use your bank's mobile app, internet banking, or USSD transfer to send money to the account above.
                            </p>
                        </div>
                    ) : pendingAccounts.length > 0 || failedAccounts.length > 0 ? (
                        <div className="space-y-3">
                            {pendingAccounts.map((account, index) => (
                                <div key={account._id || `pending-${index}`} className="bg-amber-50 border border-amber-100 rounded-xl p-5 flex items-start gap-3">
                                    <Clock3 size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-amber-900">{getVirtualAccountProviderLabel(account)} account setup in progress</p>
                                        <p className="text-xs text-amber-700 font-medium mt-1">We will show the account details here when they are ready.</p>
                                    </div>
                                </div>
                            ))}
                            {failedAccounts.map((account, index) => (
                                <div key={account._id || `failed-${index}`} className="bg-rose-50 border border-rose-100 rounded-xl p-5 flex items-start gap-3">
                                    <CircleAlert size={20} className="text-rose-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-rose-900">{getVirtualAccountProviderLabel(account)} account unavailable</p>
                                        <p className="text-xs text-rose-700 font-medium mt-1">Account setup could not be completed. Please contact support if this continues.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-start gap-3">
                            <Building2 size={20} className="text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-slate-900">No bank transfer account available yet</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Choose an enabled provider below to request one.</p>
                            </div>
                        </div>
                    )}

                    <VirtualAccountProvisioningPanel
                        virtualAccounts={virtualAccounts}
                        fundingMethods={fundingMethods}
                    />
                </div>
            )}

            {/* Panel: Card / USSD → amount + hosted checkout */}
            {(selected === 'card' || selected === 'ussd') && (
                <div className="bg-surface border border-slate-50 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-brand-emerald border border-brand-emerald/20 shrink-0">
                            {selected === 'ussd' ? <Smartphone size={24} /> : <CreditCard size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{selected === 'ussd' ? 'Pay with USSD' : 'Pay with Card'}</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {selected === 'ussd'
                                    ? "Your bank's USSD code will be presented on the secure checkout page."
                                    : 'You will be redirected to a secure checkout to complete your card payment.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Payment Amount ({currency})</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-surface border-2 border-slate-50 rounded-2xl p-6 text-3xl font-bold text-slate-900 focus:border-brand-emerald outline-none transition-all placeholder:text-slate-200"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold text-xs uppercase">
                                {currency}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {['500', '1000', '5000', '10000'].map((val) => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
                                className="bg-surface border border-slate-50 py-3 rounded-xl font-bold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-sm"
                            >
                                +{currency}{Number(val).toLocaleString()}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={!amount || Number(amount) <= 0 || loadingPayment}
                        onClick={handlePayment}
                        className="w-full bg-brand-emerald text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-brand-emerald-600 transition-all shadow-btn disabled:opacity-30 disabled:pointer-events-none"
                    >
                        {loadingPayment ? 'Redirecting...' : 'Continue to Payment'}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <ShieldCheck size={14} />
                        <span>AES-256 Encrypted Transfer</span>
                    </div>
                </div>
            )}

            {/* Empty state hint */}
            {!selected && (
                <p className="text-center text-xs text-slate-400 font-medium">
                    Select a payment method above to continue.
                </p>
            )}
        </div>
    );
};

export default UserFundWalletPage;
