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
                "py-4 px-4 transition rounded-xl " +
                "hover:bg-white/60 " +
                (isActive ? "ring-2 ring-sky-500/60 bg-white/70" : "")
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

                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={() => onView(tx)}
                            className="text-xs px-3 py-1 rounded-full border border-slate-300 bg-white hover:bg-slate-100"
                        >
                            View receipt
                        </button>
                        <button
                            onClick={() => printReceipt(tx)}
                            className="text-xs px-3 py-1 rounded-full border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-700"
                            title="Open system print dialog (choose 'Save as PDF')"
                        >
                            Print / Save PDF
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
