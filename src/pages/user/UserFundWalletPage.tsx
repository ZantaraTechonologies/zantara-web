import React, { useState } from 'react';
import {
    CreditCard,
    Building2,
    ArrowLeft,
    CheckCircle2,
    Copy,
    ShieldCheck,
    Smartphone,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from '../../store/wallet/walletStore';
import * as walletService from '../../services/wallet/walletService';
import { toast } from 'react-hot-toast';

const UserFundWalletPage: React.FC = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<'bank' | 'card' | 'ussd' | null>(null);
    const [amount, setAmount] = useState('');
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [availableChannels, setAvailableChannels] = useState<Set<string>>(new Set());
    const { virtualAccount, fetchVirtualAccount, generateAccounts, currency } = useWalletStore();

    React.useEffect(() => {
        fetchVirtualAccount();
        walletService.getFundingMethods()
            .then((methods) => {
                const set = new Set<string>();
                (methods || []).forEach((m) => (m.supportedChannels || []).forEach((c) => set.add(c)));
                setAvailableChannels(set);
            })
            .catch(() => {
                // Funding-methods lookup failed — fall back to Bank Transfer + Card, hide USSD.
            });
    }, []);

    const channelsKnown = availableChannels.size > 0;
    const showCard = !channelsKnown || availableChannels.has('card');
    const showUssd = channelsKnown && availableChannels.has('ussd');
    const isBankTransfer = selected === 'bank';

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

    const copyToClipboard = (text: string) => {
        if (!text || text.includes('Not Generated')) return;
        navigator.clipboard.writeText(text)
            .then(() => toast.success('Account number copied to clipboard'))
            .catch(() => {});
    };

    const handleGenerateAccount = async () => {
        try {
            setGenerating(true);
            await generateAccounts();
            toast.success('Permanent account generated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate your account. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

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
            const callback_url = `${window.location.origin}/paystack/return`;
            const data = await walletService.initWalletFunding(val, channel, callback_url);

            if (data?.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                throw new Error('No authorization URL received');
            }
        } catch (error) {
            console.error('Payment init failed:', error);
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

                    {virtualAccount ? (
                        <div className="space-y-5">
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 divide-y divide-slate-100">
                                <div className="flex items-center justify-between px-5 py-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bank</p>
                                        <p className="font-bold text-slate-900 mt-0.5">{virtualAccount.bankName || 'Not Generated'}</p>
                                    </div>
                                    {virtualAccount.bankName && (
                                        <button onClick={() => copyToClipboard(virtualAccount.bankName)} className="text-slate-400 hover:text-brand-emerald transition-colors p-2">
                                            <Copy size={18} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center justify-between px-5 py-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Number</p>
                                        <p className="text-2xl font-extrabold tracking-[0.1em] text-brand-emerald mt-0.5">{virtualAccount.accountNumber || '----------'}</p>
                                    </div>
                                    {virtualAccount.accountNumber && (
                                        <button onClick={() => copyToClipboard(virtualAccount.accountNumber)} className="text-brand-emerald hover:text-slate-900 transition-colors p-2">
                                            <Copy size={20} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center justify-between px-5 py-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Name</p>
                                        <p className="font-bold text-slate-900 mt-0.5">{virtualAccount.accountName || 'Not Generated'}</p>
                                    </div>
                                    {virtualAccount.accountName && (
                                        <button onClick={() => copyToClipboard(virtualAccount.accountName)} className="text-slate-400 hover:text-brand-emerald transition-colors p-2">
                                            <Copy size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

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
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1">
                                <p className="font-bold text-slate-900">Provision your permanent account</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">We'll create a dedicated account you can reuse for every top-up.</p>
                            </div>
                            <button
                                onClick={handleGenerateAccount}
                                disabled={generating}
                                className="flex items-center gap-2 justify-center bg-brand-emerald text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-emerald-600 transition-all shadow-btn disabled:opacity-50"
                            >
                                {generating ? <RefreshCw size={15} className="animate-spin" /> : <Building2 size={15} />}
                                {generating ? 'Generating...' : 'Generate Account'}
                            </button>
                        </div>
                    )}
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