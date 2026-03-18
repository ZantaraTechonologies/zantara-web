import React, { forwardRef, useImperativeHandle } from "react";
import { useWalletStore } from "../../store/wallet/walletStore";

type Props = {
    onFund: () => void;
};

// Expose this handle to the parent:
export type WalletCardHandle = { refresh: () => void };

function WalletCard({ onFund }: Props, ref: React.Ref<WalletCardHandle>) {
    const { balance, currency, loading, fetchBalance } = useWalletStore();

    useImperativeHandle(ref, () => ({ refresh: () => fetchBalance() }), [fetchBalance]);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-0">
                <h3 className="text-lg font-bold text-slate-900">Wallet</h3>
                <button
                    onClick={() => fetchBalance()}
                    className="text-sm font-medium text-sky-700 hover:text-sky-800 underline underline-offset-4 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Refreshing…" : "Refresh"}
                </button>
            </div>

            {/* Body */}
            <div className="p-5">
                {loading ? (
                    <div className="mt-2">
                        <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                    </div>
                ) : (
                    <div className="mt-2">
                        <div className="rounded-xl p-4 bg-sky-50 border border-sky-100">
                            <div className="text-xs text-sky-700/80">Available Balance</div>
                            <div className="text-2xl font-extrabold text-slate-900">
                                {currency}{" "}
                                {balance.toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                    <button
                        onClick={onFund}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-sm"
                    >
                        Fund Wallet
                    </button>
                </div>

                <p className="text-xs text-slate-500 mt-3">
                    Last updated just now. Funding confirmation may take a few seconds
                    while we receive the Paystack webhook.
                </p>
            </div>
        </div>
    );
}

export default forwardRef<WalletCardHandle, Props>(WalletCard);
