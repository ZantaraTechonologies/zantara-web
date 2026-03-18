// src/components/wallet/TxRow.tsx
import type { TxLog } from "../../services/transactions/transactionService";
import { printReceipt } from "./receipt";

export default function TxRow({
    tx,
    isActive,
    onView,
}: {
    tx: TxLog & { _orig?: any };
    isActive: boolean;
    onView: (tx: TxLog & { _orig?: any }) => void;
}) {
    const amountColor =
        tx.status === "success"
            ? "text-emerald-700"
            : tx.status === "failed"
                ? "text-rose-700"
                : "text-amber-700";

    return (
        <li
            className={
                "py-5 px-6 transition rounded-2xl " +
                "hover:bg-slate-50 " +
                (isActive ? "ring-2 ring-emerald-500/20 bg-emerald-50/30" : "")
            }
        >
            <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                {/* Left side: title, date, ref, buttons */}
                <div className="min-w-0">
                    <div className="text-sm font-semibold capitalize text-slate-800">
                        {labelize(tx.type)}{tx.service ? ` · ${tx.service}` : ""}
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ""}
                    </div>

                    {tx.refId && (
                        <div className="mt-0.5 text-xs text-slate-500 truncate">
                            Ref: {tx.refId}
                        </div>
                    )}

                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => onView(tx)}
                            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Details
                        </button>
                        <button
                            onClick={() => printReceipt(tx)}
                            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-500/10"
                        >
                            PDF Receipt
                        </button>
                    </div>
                </div>

                {/* Right side: amount + status underneath */}
                <div className="text-right">
                    <div className={`text-base sm:text-lg font-extrabold tabular-nums ${amountColor}`}>
                        {(tx.currency ?? "NGN") + " " + (tx.amount ?? 0).toLocaleString()}
                    </div>
                    <div className="mt-1">
                        <StatusBadge status={tx.status} />
                    </div>
                </div>
            </div>
        </li>
    );
}

function StatusBadge({ status }: { status: "success" | "failed" | "pending" | string }) {
    const style =
        status === "success"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : status === "failed"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-amber-50 text-amber-700 border border-amber-200";

    return (
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${style}`}>
            {status}
        </span>
    );
}

function labelize(s?: string) {
    if (!s) return "";
    return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
