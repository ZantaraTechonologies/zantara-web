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

    // -------- UI shell (keeps your blue vibe, stays responsive in page container) --------
    const shellCls =
        "my-6 w-full rounded-2xl border border-sky-200 bg-gradient-to-b from-sky-50 to-sky-100 shadow-md";

    const skeleton = (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse h-16 rounded-xl bg-white/60" />
            ))}
        </div>
    );

    if (error) {
        return (
            <section className={shellCls}>
                <header className="px-4 sm:px-5 py-3 border-b border-sky-200 bg-sky-100/70 rounded-t-2xl">
                    <h3 className="font-semibold text-sky-900">Recent Transactions</h3>
                </header>
                <div className="p-4 sm:p-5">
                    <p className="text-sm text-rose-600">Failed to load transactions.</p>
                </div>
            </section>
        );
    }

    return (
        <section className={shellCls}>
            {/* Header */}
            <header className="px-4 sm:px-5 py-3 border-b border-sky-200 bg-sky-100/70 rounded-t-2xl">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h3 className="font-semibold text-sky-900">Recent Transactions</h3>

                    {/* Controls: search + status + export */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="h-9 w-64 max-w-full rounded-lg border border-sky-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                                placeholder="Search ref, status, type, amount..."
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="h-9 rounded-lg border border-sky-200 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                                title="Filter by status"
                            >
                                <option value="all">All</option>
                                <option value="success">Success</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={downloadCSV}
                                className="h-9 rounded-lg bg-sky-600 px-3 text-sm font-semibold text-white hover:bg-sky-700"
                                title="Download filtered results as CSV"
                            >
                                Save CSV
                            </button>
                            {query || statusFilter !== "all" ? (
                                <button
                                    onClick={() => {
                                        setQuery("");
                                        setStatusFilter("all");
                                    }}
                                    className="h-9 rounded-lg border border-sky-300 bg-white px-3 text-sm hover:bg-sky-50"
                                    title="Clear filters"
                                >
                                    Clear
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </header>

            {/* Body */}
            <div className="p-2 sm:p-3">
                {isLoading ? (
                    skeleton
                ) : filteredItems.length === 0 ? (
                    <p className="text-sm text-sky-900/70 px-3 py-2">No transactions match your filters.</p>
                ) : (
                    <ul className="divide-y divide-sky-200">
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
