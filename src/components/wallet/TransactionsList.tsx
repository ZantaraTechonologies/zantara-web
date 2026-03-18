import { useMemo, useState } from "react";
import type { TxLog } from "../../services/transactions/transactionService";
import { useMyTransactions } from "../../hooks/useWallet";
import TxRow from "../../components/wallet/TxRow";
import ReceiptModal from "../../components/wallet/ReceiptModal";

type TransactionsListProps = {
    limit?: number;
    highlightRef?: string | null;
};

export default function TransactionsList({
    limit = 10,
    highlightRef = null,
}: TransactionsListProps) {
    const { data, isLoading, error } = useMyTransactions({ limit });

    // -------- Normalize incoming data shape --------
    const items: (TxLog & { _orig?: any })[] = Array.isArray(data?.items)
        ? (data!.items as (TxLog & { _orig?: any })[])
        : Array.isArray((data as any)?.data)
            ? (data as any).data
            : Array.isArray(data as any)
                ? (data as any)
                : [];

    // -------- Utilities for robust field access --------
    const getTime = (t: any) =>
        new Date(
            t.timestamp ??
            t.createdAt ??
            t._orig?.timestamp ??
            t._orig?.createdAt ??
            0
        ).getTime();

    const getRef = (t: any) =>
        t.refId ??
        t.reference ??
        t._orig?.ref ??
        t._orig?.reference ??
        t._orig?.requestId ??
        t._orig?.transactionId ??
        "";

    const getStatus = (t: any) =>
        (t.status ?? t._orig?.status ?? "").toString().toLowerCase();

    const getType = (t: any) => (t.type ?? t._orig?.type ?? "").toString();

    const getAmount = (t: any) =>
        Number(
            t.amount ??
            t.value ??
            t._orig?.amount ??
            t._orig?.value ??
            0
        );

    // -------- Sort newest-first (defensive) --------
    const sortedItems = useMemo(
        () => [...items].sort((a, b) => getTime(b) - getTime(a)),
        [items]
    );

    // -------- Search / Filter UI state --------
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed" | "pending">("all");

    // -------- Apply filters --------
    const filteredItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        return sortedItems.filter((t) => {
            // Status filter
            if (statusFilter !== "all" && getStatus(t) !== statusFilter) return false;

            // Text search across several fields
            if (!q) return true;
            const hay = [
                getRef(t),
                getStatus(t),
                getType(t),
                getAmount(t).toString(),
                new Date(getTime(t)).toLocaleString(),
            ]
                .join(" ")
                .toLowerCase();

            return hay.includes(q);
        });
    }, [sortedItems, query, statusFilter]);

    // -------- Highlight (after sorting; independent of filtering) --------
    const active = useMemo(() => {
        if (!highlightRef || sortedItems.length === 0) return null;
        return (
            sortedItems.find((t: any) =>
                [
                    t.refId,
                    t._orig?.ref,
                    t._orig?.reference,
                    t._orig?.requestId,
                    t._orig?.transactionId,
                    t.reference,
                ].some((v) => v === highlightRef)
            ) ?? null
        );
    }, [highlightRef, sortedItems]);

    const [selected, setSelected] = useState<(TxLog & { _orig?: any }) | null>(active || null);

    // -------- Export to CSV (Excel-friendly) --------
    const downloadCSV = () => {
        const rows = filteredItems;

        const headers = ["Date/Time", "Reference", "Type", "Status", "Amount"];
        const toRow = (t: any) => [
            new Date(getTime(t)).toISOString(),
            getRef(t),
            getType(t),
            getStatus(t),
            getAmount(t),
        ];

        const csv =
            [headers, ...rows.map(toRow)]
                .map((arr) =>
                    arr
                        .map((val) => {
                            const s = String(val ?? "");
                            // Escape double-quotes for CSV
                            const esc = s.replace(/"/g, '""');
                            // Quote if needed (commas, quotes, or newlines)
                            return /[",\n]/.test(esc) ? `"${esc}"` : esc;
                        })
                        .join(",")
                )
                .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
        a.download = `transactions_${ts}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // -------- UI shell (Zantara Emerald Theme) --------
    const shellCls =
        "w-full rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden";

    const skeleton = (
        <div className="space-y-4 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse h-16 rounded-2xl bg-slate-50" />
            ))}
        </div>
    );

    if (error) {
        return (
            <section className={shellCls}>
                <header className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Recent Transactions</h3>
                </header>
                <div className="p-6">
                    <p className="text-sm text-red-600 font-medium">Failed to load transactions. Please check your connection.</p>
                </div>
            </section>
        );
    }

    return (
        <section className={shellCls}>
            {/* Header */}
            <header className="px-6 py-5 border-b border-slate-50 bg-slate-50/30">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h3 className="font-bold text-slate-900">Transaction History</h3>

                    {/* Controls: search + status + export */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="h-10 w-64 max-w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
                                placeholder="Ref, status, type..."
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-bold text-slate-700"
                                title="Filter"
                            >
                                <option value="all">All Status</option>
                                <option value="success">Success</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={downloadCSV}
                                className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-sm"
                            >
                                Export CSV
                            </button>
                            {(query || statusFilter !== "all") && (
                                <button
                                    onClick={() => {
                                        setQuery("");
                                        setStatusFilter("all");
                                    }}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Body */}
            <div className="p-2 sm:p-4">
                {isLoading ? (
                    skeleton
                ) : filteredItems.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-slate-400 font-medium tracking-tight">No transactions found matching your criteria.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-50">
                        {filteredItems.map((tx) => {
                            const isActive =
                                !!highlightRef &&
                                (tx.refId === highlightRef ||
                                    tx._orig?.ref === highlightRef ||
                                    tx._orig?.reference === highlightRef ||
                                    tx._orig?.requestId === highlightRef ||
                                    tx._orig?.transactionId === highlightRef ||
                                    (tx as any).reference === highlightRef);

                            return (
                                <TxRow
                                    key={(tx as any).id ?? (tx as any)._id ?? getRef(tx)}
                                    tx={tx}
                                    isActive={!!isActive}
                                    onView={(t) => setSelected(t)}
                                />
                            );
                        })}
                    </ul>
                )}
            </div>

            {selected && <ReceiptModal tx={selected} onClose={() => setSelected(null)} />}
        </section>
    );
}
