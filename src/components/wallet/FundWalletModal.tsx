import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../../services/api/apiClient";

/**
 * FundWalletModal (updated)
 * - Keeps the original light UI (white/blue) and RadioPill style
 * - Adds fast-finish via window.postMessage from the return page (PAYSTACK_RESULT)
 * - Passes (amount, reference?) to onSuccess
 * - Accepts authorization_url or authUrl from backend
 * - Keeps polling as a fallback
 */
type Channel = "all" | "card" | "ussd" | "bank_transfer";

interface FundWalletModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: (amount: number, reference?: string) => void; // <-- now includes reference (optional)
}

const MIN_AMOUNT = 50;

const FundWalletModal: React.FC<FundWalletModalProps> = ({ open, onClose, onSuccess }) => {
    const [amount, setAmount] = useState<string>("");
    const [channel, setChannel] = useState<Channel>("all");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reference, setReference] = useState<string>("");
    const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
    const [error, setError] = useState<string>("");

    // timers / window refs
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const payWindowRef = useRef<Window | null>(null);

    // Build channels payload for backend
    const selectedChannels = useMemo(() => {
        if (channel === "all") return ["card", "ussd", "bank_transfer"];
        return [channel];
    }, [channel]);

    // Reset on close
    useEffect(() => {
        if (!open) {
            setAmount("");
            setChannel("all");
            setIsSubmitting(false);
            setReference("");
            setStatus("idle");
            setError("");
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        }
    }, [open]);

    // Fast-finish listener (from your callback/return page)
    // The return page should call: window.opener?.postMessage({ type: "PAYSTACK_RESULT", status, reference }, "*")
    useEffect(() => {
        function onMsg(e: MessageEvent) {
            const data: any = e?.data;
            if (!data || data.type !== "PAYSTACK_RESULT") return;
            if (reference && data.reference && data.reference !== reference) return;

            const s = String(data.status || "").toLowerCase();
            if (s === "success") {
                if (pollTimerRef.current) {
                    clearInterval(pollTimerRef.current);
                    pollTimerRef.current = null;
                }
                setStatus("success");
                setIsSubmitting(false);
                onSuccess?.(parseFloat(amount || "0"), reference || data.reference);
            } else if (s === "failed") {
                if (pollTimerRef.current) {
                    clearInterval(pollTimerRef.current);
                    pollTimerRef.current = null;
                }
                setStatus("failed");
                setIsSubmitting(false);
            }
        }
        window.addEventListener("message", onMsg);
        return () => window.removeEventListener("message", onMsg);
    }, [amount, onSuccess, reference]);

    // Poll verify endpoint while we have a reference and status is pending
    useEffect(() => {
        if (!reference || status !== "pending") return;

        let tries = 0;
        pollTimerRef.current = setInterval(async () => {
            tries += 1;
            try {
                const { data } = await API.get<{ status: "pending" | "success" | "failed" | "not_found" }>(
                    "/wallet/verify",
                    {
                        params: { reference },
                        headers: {
                            "Cache-Control": "no-cache",
                            Pragma: "no-cache",
                        },
                    }
                );

                const s = (data?.status || "not_found") as "pending" | "success" | "failed" | "not_found";
                if (s === "success") {
                    setStatus("success");
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                    pollTimerRef.current = null;
                    setIsSubmitting(false);
                    const amt = parseFloat(amount || "0");
                    if (!Number.isNaN(amt)) onSuccess?.(amt, reference);
                } else if (s === "failed") {
                    setStatus("failed");
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                    pollTimerRef.current = null;
                    setIsSubmitting(false);
                } else if (tries >= 60) {
                    // ~3 minutes max
                    setStatus("failed");
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                    pollTimerRef.current = null;
                    setIsSubmitting(false);
                }
            } catch {
                if (tries >= 60) {
                    setStatus("failed");
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                    pollTimerRef.current = null;
                    setIsSubmitting(false);
                }
            }
        }, 3000);

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        };
    }, [reference, status, amount, onSuccess]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const amtNum = Number(amount);
        if (!amtNum || amtNum < MIN_AMOUNT) {
            setError(`Please enter a valid amount (minimum ₦${MIN_AMOUNT}).`);
            return;
        }

        try {
            setIsSubmitting(true);

            // Axios returns { data }
            const { data } = await API.post<{ authorization_url?: string; authUrl?: string; reference: string }>(
                "/wallet/fund",
                {
                    amount: amtNum,
                    channels: selectedChannels, // e.g. ['card','ussd','bank_transfer']
                }
            );

            const authorization_url = data?.authorization_url || data?.authUrl;
            const ref = data?.reference;
            if (!authorization_url || !ref) {
                throw new Error("Invalid response from server. Missing authorization_url/authUrl or reference.");
            }

            // Save the reference for polling and set pending
            setReference(ref);
            setStatus("pending");

            // Open Paystack checkout in a new tab (keeps this tab alive for polling)
            payWindowRef.current = window.open(authorization_url, "_blank", "noopener,noreferrer");
        } catch (err: any) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong while initializing payment.";
            setError(msg);
            setIsSubmitting(false);
            setStatus("idle");
        }
    };

    const closeAndReset = () => {
        onClose();
    };

    if (!open) return null;

    const isBusy = isSubmitting || status === "pending";

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
            {/* Light backdrop (no dark overlay) */}
            <div className="absolute inset-0 bg-blue-50/60" aria-hidden="true" />

            {/* Modal card */}
            <div
                className="relative mt-16 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-blue-200"
                role="dialog"
                aria-modal="true"
                aria-labelledby="fund-wallet-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between rounded-t-2xl bg-blue-600 px-5 py-4">
                    <h2 id="fund-wallet-title" className="text-white text-lg font-semibold">
                        Fund Wallet
                    </h2>
                    <button
                        onClick={closeAndReset}
                        className="rounded-md bg-white/10 px-3 py-1 text-white hover:bg-white/20 focus:outline-none"
                    >
                        Close
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={onSubmit} className="space-y-5 px-6 py-5">
                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                            Amount (₦)
                        </label>
                        <input
                            id="amount"
                            type="number"
                            min={MIN_AMOUNT}
                            step="50"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
                            placeholder="e.g., 1000"
                            required
                            disabled={isBusy}
                        />
                        <p className="mt-1 text-xs text-gray-500">Minimum ₦{MIN_AMOUNT}. Charges may apply depending on channel.</p>
                    </div>

                    {/* Channels */}
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-700">Payment Method</p>
                        <div className="grid grid-cols-2 gap-2">
                            <RadioPill
                                label="All Methods"
                                value="all"
                                checked={channel === "all"}
                                onChange={() => setChannel("all")}
                            />
                            <RadioPill
                                label="Card"
                                value="card"
                                checked={channel === "card"}
                                onChange={() => setChannel("card")}
                            />
                            <RadioPill
                                label="USSD"
                                value="ussd"
                                checked={channel === "ussd"}
                                onChange={() => setChannel("ussd")}
                            />
                            <RadioPill
                                label="Bank Transfer"
                                value="bank_transfer"
                                checked={channel === "bank_transfer"}
                                onChange={() => setChannel("bank_transfer")}
                            />
                        </div>
                    </div>

                    {/* Status / Errors */}
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {status === "pending" && (
                        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                            Processing payment… We’re waiting for confirmation. You can keep this window open.
                        </div>
                    )}

                    {status === "success" && (
                        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            Wallet funded successfully! 🎉
                        </div>
                    )}

                    {status === "failed" && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                            We couldn’t confirm the payment. If you were charged, it will be auto-reconciled shortly.
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        {status === "pending" && (
                            <button
                                type="button"
                                onClick={async () => {
                                    // Manual check trigger
                                    try {
                                        const { data } = await API.get(`/wallet/verify?reference=${reference}`);
                                        if (data.status === 'success') {
                                            setStatus("success");
                                            onSuccess?.(Number(amount), reference);
                                        } else {
                                            alert(`Status: ${data.status}`);
                                        }
                                    } catch (e) { alert('Check failed'); }
                                }}
                                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100"
                            >
                                Check Status
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={closeAndReset}
                            className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-blue-700 hover:bg-blue-50 focus:outline-none"
                            disabled={isBusy && status !== "pending"} // Allow cancel during pending if needed, or keep disabled. Actually allow cancel.
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isBusy}
                            className={`rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 ${status === 'pending' ? 'hidden' : ''}`}
                        >
                            {isSubmitting ? "Starting…" : "Proceed to Paystack"}
                        </button>
                    </div>
                </form>

                {/* Footer helper */}
                <div className="rounded-b-2xl bg-blue-50 px-6 py-3 text-xs text-blue-800">
                    Tip: If you chose USSD or Bank Transfer, confirmation can take a moment. We’ll update automatically.
                </div>
            </div>
        </div>
    );
};

export default FundWalletModal;

/** -------------------------
 *  Little radio pill control
 *  -------------------------
 */
interface RadioPillProps {
    label: string;
    value: string;
    checked: boolean;
    onChange: () => void;
}

const RadioPill: React.FC<RadioPillProps> = ({ label, value, checked, onChange }) => {
    return (
        <label
            className={[
                "flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-sm",
                checked
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
            ].join(" ")}
        >
            <input
                type="radio"
                name="channel"
                value={value}
                checked={checked}
                onChange={onChange}
                className="hidden"
            />
            {label}
        </label>
    );
};
