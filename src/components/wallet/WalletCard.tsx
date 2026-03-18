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
            <div className="flex items-center justify-between p-6 pb-0">
                <h3 className="text-lg font-bold text-slate-900">Wallet</h3>
                <button
                    onClick={() => fetchBalance()}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 underline underline-offset-8 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Syncing…" : "Sync"}
                </button>
            </div>

            {/* Body */}
            <div className="p-6">
                {loading ? (
                    <div className="mt-2">
                        <div className="h-16 rounded-[1.5rem] bg-slate-50 animate-pulse" />
                    </div>
                ) : (
                    <div className="mt-2">
                        <div className="rounded-[1.5rem] p-6 bg-emerald-50 border border-emerald-100/50">
                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-800/60 mb-1">Available Liquid</div>
                            <div className="text-4xl font-black text-slate-900 tracking-tighter">
                                {currency}{" "}
                                {balance.toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onFund}
                        className="w-full py-4 rounded-[1.5rem] bg-slate-950 hover:bg-emerald-500 text-white hover:text-slate-950 font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-slate-100"
                    >
                        Deposit Funds
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
