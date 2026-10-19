import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Building2, Clock3, CreditCard, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getSessionEpoch, isSessionEpochCurrent } from '../../app/sessionLifecycle';
import * as walletService from '../../services/wallet/walletService';
import { useAuthStore } from '../../store/auth/authStore';
import { useWalletStore } from '../../store/wallet/walletStore';
import { isTrustedHostedCheckoutUrl } from '../../utils/hostedCheckout';
import {
    clearPendingFunding,
    getPendingFunding,
    PendingFunding,
    savePendingFunding,
} from '../../utils/pendingFunding';

const validFundingAmount = (value: string) => {
    if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return false;
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= 50 && Number.isSafeInteger(Math.round(amount * 100));
};

const identityOf = (user: any) => String(user?.id || user?._id || '');

const UserFundWalletPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const currency = useWalletStore(state => state.currency);
    const fetchBalance = useWalletStore(state => state.fetchBalance);
    const [amount, setAmount] = useState('');
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [pending, setPending] = useState<PendingFunding | null>(null);
    const submissionStarted = useRef(false);
    const userId = identityOf(user);

    const checkPending = async (payment: PendingFunding, showMessage = true) => {
        const epoch = getSessionEpoch();
        try {
            const result = await walletService.verifyFunding(payment.reference);
            if (!isSessionEpochCurrent(epoch) || identityOf(useAuthStore.getState().user) !== payment.userId) return;
            if (result?.status === 'success') {
                clearPendingFunding(payment.userId, payment.reference);
                setPending(null);
                await fetchBalance();
                if (
                    showMessage
                    && isSessionEpochCurrent(epoch)
                    && identityOf(useAuthStore.getState().user) === payment.userId
                ) toast.success('Payment confirmed. Your current balance is shown in your wallet.');
            } else if (result?.status === 'failed' || result?.status === 'not_found') {
                clearPendingFunding(payment.userId, payment.reference);
                setPending(null);
                if (showMessage) toast.error('Payment was not completed.');
            } else if (showMessage) {
                toast('Payment is still being confirmed. Do not start another payment yet.');
            }
        } catch {
            if (showMessage && isSessionEpochCurrent(epoch)) {
                toast.error('Unable to check payment status. The reference remains safe for recovery.');
            }
        }
    };

    useEffect(() => {
        if (!userId) return;
        const existing = getPendingFunding(userId);
        setPending(existing);
        if (existing) void checkPending(existing, false);
    }, [userId]);

    const handlePayment = async () => {
        if (submissionStarted.current || loadingPayment) return;
        if (!validFundingAmount(amount)) {
            toast.error('Enter at least ₦50 with no more than two decimal places.');
            return;
        }
        if (!userId) {
            toast.error('Your session has expired. Please sign in again.');
            return;
        }
        const existing = getPendingFunding(userId);
        if (existing) {
            setPending(existing);
            toast('Check the existing payment before starting another one.');
            return;
        }

        submissionStarted.current = true;
        setLoadingPayment(true);
        const epoch = getSessionEpoch();
        const fundingAmount = Number(amount);
        try {
            const result = await walletService.initWalletFunding(fundingAmount);
            if (!isSessionEpochCurrent(epoch) || identityOf(useAuthStore.getState().user) !== userId) return;

            if (
                result.kind === 'checkout'
                && (!result.authorizationUrl || !isTrustedHostedCheckoutUrl(result.authorizationUrl, result.checkoutProvider))
            ) {
                toast.error('The payment provider returned an unsafe checkout address. No checkout was opened.');
                return;
            }

            const record: PendingFunding = {
                userId,
                reference: result.reference,
                provider: result.provider,
                amount: fundingAmount,
                initiatedAt: Date.now(),
            };
            if (!savePendingFunding(record)) {
                toast.error('Unable to preserve payment recovery details. Please do not continue.');
                return;
            }
            setPending(record);

            if (result.kind === 'pending') {
                toast('Payment initialization is being checked. Do not start another payment.');
                return;
            }
            window.location.assign(result.authorizationUrl);
        } catch (error: any) {
            if (isSessionEpochCurrent(epoch)) {
                const backendMessage = error?.response?.data?.message;
                toast.error(
                    typeof backendMessage === 'string' && backendMessage.trim()
                        ? backendMessage
                        : 'We could not safely confirm payment initialization. Check your transactions before trying again.',
                );
            }
        } finally {
            submissionStarted.current = false;
            if (isSessionEpochCurrent(epoch)) setLoadingPayment(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-5 lg:p-6 space-y-6 animate-in slide-in-from-bottom-8 duration-700 font-sans">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-3 bg-surface border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft size={18} className="text-slate-900" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fund Wallet</h1>
                    <p className="text-slate-500 font-medium text-sm">Enter an amount and continue to secure hosted checkout.</p>
                </div>
            </div>

            {pending && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <Clock3 className="text-amber-700 shrink-0" size={24} />
                    <div className="flex-1">
                        <p className="font-bold text-amber-900">Payment confirmation pending</p>
                        <p className="text-sm text-amber-800 mt-1">Reference {pending.reference}. Do not start another payment until this attempt is resolved.</p>
                    </div>
                    <button type="button" onClick={() => void checkPending(pending)} className="rounded-xl bg-amber-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
                        Check Status
                    </button>
                </div>
            )}

            <div className="bg-surface border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-brand-emerald border border-brand-emerald/20">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900">Secure Online Payment</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Choose from the methods enabled by the payment provider on the next screen.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Payment Amount ({currency})</label>
                    <div className="relative">
                        <input
                            type="number"
                            inputMode="decimal"
                            min="50"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            className="w-full bg-surface border-2 border-slate-100 rounded-2xl p-6 text-3xl font-bold text-slate-900 focus:border-brand-emerald outline-none transition-all placeholder:text-slate-200"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold text-xs uppercase">{currency}</div>
                    </div>
                    <p className="text-xs text-slate-500">Minimum funding amount is ₦50.00.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['500', '1000', '5000', '10000'].map(value => (
                        <button key={value} type="button" onClick={() => setAmount(value)} className="bg-surface border border-slate-100 py-3 rounded-xl font-bold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-sm">
                            +{currency}{Number(value).toLocaleString()}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    disabled={!validFundingAmount(amount) || loadingPayment || !!pending}
                    onClick={handlePayment}
                    className="w-full bg-brand-emerald text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-brand-emerald-600 transition-all shadow-btn disabled:opacity-30 disabled:pointer-events-none"
                >
                    {loadingPayment ? 'Opening Secure Checkout...' : 'Continue to Payment'}
                </button>

                <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <ShieldCheck size={14} />
                    <span>Verified hosted checkout</span>
                </div>
            </div>

            <Link to="/app/wallet/virtual-account" className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-700 hover:border-emerald-200 transition-colors">
                <Building2 size={20} className="text-brand-emerald" />
                <div>
                    <p className="font-bold text-sm">Prefer a bank transfer?</p>
                    <p className="text-xs text-slate-500 mt-0.5">View your permanent Bank Transfer Accounts.</p>
                </div>
            </Link>
        </div>
    );
};

export default UserFundWalletPage;
