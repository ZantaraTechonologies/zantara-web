// Shared wallet-funding return handler for all card gateways.
// Rendered by /paystack/return, /monnify/return and /flutterwave/return.
// The backend is the single authority: this page only triggers server-side
// verification and reflects the backend's verdict. It never credits anything
// and never reads gateway status query parameters.
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as walletService from '../../services/wallet/walletService';
import { useWalletStore } from '../../store/wallet/walletStore';
import { runPaymentReturn } from '../../utils/paymentReturn';

interface PaymentReturnPageProps {
    gateway: string;
}

export default function PaymentReturnPage({ gateway }: PaymentReturnPageProps) {
    const { search } = useLocation();
    const navigate = useNavigate();
    const { fetchBalance } = useWalletStore();
    const [confirming, setConfirming] = useState(false);
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        runPaymentReturn(gateway, search, {
            navigate: (path) => {
                // Refresh wallet balance before leaving so the Wallet page shows the
                // new amount on success (harmless on failure/neutral paths).
                void fetchBalance();
                navigate(path, { replace: true });
            },
            verify: (reference) => walletService.verifyFunding(reference),
            onConfirming: () => setConfirming(true)
        }).catch((err) => {
            console.error('Payment return handling failed:', err);
            navigate('/app/wallet', { replace: true });
        });
    }, [gateway, search, navigate, fetchBalance]);

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