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

    return <div style={{ padding: 24 }}>Finalizing payment…</div>;
}
