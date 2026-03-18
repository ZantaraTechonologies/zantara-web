// src/pages/payments/PaystackReturn.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api/apiClient";

export default function PaystackReturn() {
    const { search } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(search);
        const reference = params.get("reference");

        async function finish() {
            let status = "failed";
            try {
                const { data } = await API.get("/wallet/verify", { params: { reference } });
                status = data?.status ?? "failed";
            } catch { }

            // Tell the opener (the tab with the modal)
            if (window.opener) {
                window.opener.postMessage({ type: "PAYSTACK_RESULT", reference, status }, "*");
            }

            // Option A: close this tab if it can
            window.close();

            // Option B (fallback): route to wallet page
            navigate("/app/wallet");
        }

        if (reference) finish();
    }, [search, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-['Inter',_sans-serif]">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Finalizing Payment</h2>
                    <p className="text-slate-500 font-medium mt-2 italic">Securing your transaction with Zantara Shield...</p>
                </div>
            </div>
        </div>
    );
}
