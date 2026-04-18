// src/pages/payments/PaystackReturn.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api/apiClient";
import { useWalletStore } from "../../store/wallet/walletStore";

export default function PaystackReturn() {
    const { search } = useLocation();
    const navigate = useNavigate();
    const { fetchBalance } = useWalletStore();

    useEffect(() => {
        const params = new URLSearchParams(search);
        const reference = params.get("reference");

        async function finish() {
            let type = 'funding';
            let success = false;
            try {
                const { data } = await API.get("/wallet/verify", { params: { reference } });
                success = (data?.status === "success") || (data?.status === "approved");
                type = data?.type || data?.metadata?.type || 'funding';
            } catch {
                // verification failed — navigate with failed status
            }

            if (success) {
                // Refresh wallet balance immediately so the wallet page shows the new amount
                await fetchBalance();
                
                if (type === 'investment_buy') {
                    navigate("/app/investments?success=1", { replace: true });
                } else {
                    navigate("/app/wallet?funded=1", { replace: true });
                }
            } else {
                if (type === 'investment_buy') {
                    navigate("/app/investments?success=0", { replace: true });
                } else {
                    navigate("/app/wallet?funded=0", { replace: true });
                }
            }
        }

        if (reference) {
            finish();
        } else {
            // No reference in URL — likely a direct hit; bounce home
            navigate("/app/wallet", { replace: true });
        }
    }, [search, navigate, fetchBalance]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Finalizing Payment</h2>
                    <p className="text-slate-500 font-medium mt-2 italic">Verifying your transaction...</p>
                </div>
            </div>
        </div>
    );
}
