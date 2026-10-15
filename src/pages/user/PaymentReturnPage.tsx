// Shared wallet-funding return handler for all card gateways.
// Rendered by /paystack/return, /monnify/return and /flutterwave/return.
// The backend is the single authority: this page only triggers server-side
// verification and reflects the backend's verdict. It never credits anything
// and never reads gateway status query parameters.
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as walletService from '../../services/wallet/walletService';
import { useWalletStore } from '../../store/wallet/walletStore';
import { useAuthStore } from '../../store/auth/authStore';
import { getSessionEpoch, isSessionEpochCurrent } from '../../app/sessionLifecycle';
import { runPaymentReturn } from '../../utils/paymentReturn';
import { clearPendingFunding, getPendingFunding, savePendingFunding } from '../../utils/pendingFunding';

interface PaymentReturnPageProps {
    gateway: string;
}

export default function PaymentReturnPage({ gateway }: PaymentReturnPageProps) {
    const { search } = useLocation();
    const navigate = useNavigate();
    const { fetchBalance } = useWalletStore();
    const user = useAuthStore(state => state.user);
    const [confirming, setConfirming] = useState(false);
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const epoch = getSessionEpoch();
        const userId = String(user?.id || user?._id || '');

        runPaymentReturn(gateway, search, {
            navigate: (path) => {
                if (!isSessionEpochCurrent(epoch)) return;
                // Refresh wallet balance before leaving so the Wallet page shows the
                // new amount on success (harmless on failure/neutral paths).
                void fetchBalance();
                navigate(path, { replace: true });
            },
            verify: (reference) => walletService.verifyFunding(reference),
            onConfirming: () => {
                if (isSessionEpochCurrent(epoch)) setConfirming(true);
            },
            onTerminal: (reference) => {
                if (userId && isSessionEpochCurrent(epoch)) clearPendingFunding(userId, reference);
            },
            onPending: (reference) => {
                if (!userId || !isSessionEpochCurrent(epoch)) return;
                const existing = getPendingFunding(userId);
                if (!existing || existing.reference === reference) {
                    savePendingFunding({
                        userId,
                        reference,
                        provider: gateway,
                        initiatedAt: existing?.initiatedAt || Date.now(),
                        ...(existing?.amount ? { amount: existing.amount } : {}),
                    });
                }
            }
        }).catch(() => {
            console.error('Payment return handling failed');
            if (isSessionEpochCurrent(epoch)) navigate('/app', { replace: true });
        });
    }, [gateway, search, navigate, fetchBalance, user]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        {confirming ? 'Confirming Payment' : 'Finalizing Payment'}
                    </h2>
                    <p className="text-slate-500 font-medium mt-2 italic">
                        {confirming
                            ? "We're still confirming your payment. Your wallet will be credited automatically once it's confirmed."
                            : 'Verifying your transaction...'}
                    </p>
                </div>
            </div>
        </div>
    );
}
