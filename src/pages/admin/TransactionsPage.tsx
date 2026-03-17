// ---------------------------------------------
// src/pages/admin/TransactionsPage.tsx
// ---------------------------------------------
import React, { useEffect, useMemo, useState } from "react";
import API from "../../services/api/apiClient";

// Types — align to your backend fields
export type Txn = {
    _id: string;
    createdAt: string; // ISO
    updatedAt?: string;
    user?: { _id: string; email?: string; name?: string } | string;
    userId?: string; // fallback
    service?: string; // e.g., airtime, data, electricity
    amount: number;
    status: "success" | "pending" | "failed";
    reference?: string; // provider reference
    meta?: Record<string, any>;
};

// Helper widgets
function StatusTag({ status }: { status: Txn["status"] }) {
    const map = {
        success: "bg-green-100 text-green-700",
        pending: "bg-amber-100 text-amber-700",
        failed: "bg-rose-100 text-rose-700",
    } as const;
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>{status}</span>
    );
}

function currency(n: number) {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "NGN" }).format(n);
}

function useDebounce<T>(val: T, ms = 500) {
    const [v, setV] = useState(val);
    useEffect(() => {
        const t = setTimeout(() => setV(val), ms);
        return () => clearTimeout(t);
    }, [val, ms]);
    return v;
}

export default function TransactionsPage() {
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<Txn[]>([]);
    const [total, setTotal] = useState(0);

    // Filters & pagination
    const [q, setQ] = useState("");
    const [status, setStatus] = useState<string>("");
    const [service, setService] = useState<string>("");
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");
    const [minAmt, setMinAmt] = useState<string>("");
    const [maxAmt, setMaxAmt] = useState<string>("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    const debouncedQ = useDebounce(q, 400);

    async function fetchData() {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, limit };
            if (debouncedQ) params.search = debouncedQ; // backend: allow search on user/ref
            if (status) params.status = status;
            if (service) params.service = service;
            if (from) params.from = from; // ISO date string (YYYY-MM-DD)
            if (to) params.to = to;
            if (minAmt) params.minAmount = Number(minAmt);
            if (maxAmt) params.maxAmount = Number(maxAmt);

            const { data } = await API.get("/transaction-logs/admin/transactions/all", { params });
            // Expecting shape: { items: Txn[], total: number }
            setRows(data?.items ?? data ?? []);
            setTotal(data?.total ?? (data?.items?.length ?? 0));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQ, status, service, from, to, minAmt, maxAmt, page, limit]);

    function resetFilters() {
        setQ("");
        setStatus("");
        setService("");
        setFrom("");
        setTo("");
        setMinAmt("");
        setMaxAmt("");
        setPage(1);
    }

    async function recheck(reference?: string) {
        if (!reference) return;
        const prev = rows.slice();
        try {
            const idx = rows.findIndex((r) => r.reference === reference);
            if (idx >= 0) {
                const copy = rows.slice();
                (copy[idx] as any).__checking = true;
                setRows(copy);
            }
            await API.post("/services/transaction/status", { reference });
            await fetchData();
        } catch (e) {
            console.error(e);
            // restore
            setRows(prev);
        }
    }

    function exportCSV() {
        const header = [
            "Date",
            "User",
            "Service",
            "Amount",
            "Status",
            "Reference",
        ];
        const lines = rows.map((r) => [
            new Date(r.createdAt).toLocaleString(),
            typeof r.user === "string" ? r.user : (r.user?.email ?? r.user?.name ?? r.user?._id ?? r.userId ?? ""),
            r.service ?? "",
            String(r.amount),
            r.status,
            r.reference ?? "",
        ]);
        const csv = [header, ...lines].map((a) => a.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Transactions</h1>
                <div className="flex items-center gap-2">
                    <button onClick={exportCSV} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-sm">Export CSV</button>
                    <button onClick={resetFilters} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm">Reset</button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search (user/ref)" className="px-3 py-2 rounded-xl border border-slate-200" />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200">
                    <option value="">Status</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>
                <select value={service} onChange={(e) => setService(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200">
                    <option value="">Service</option>
                    <option value="airtime">Airtime</option>
                    <option value="data">Data</option>
                    <option value="electricity">Electricity</option>
                    <option value="cable">Cable</option>
                    <option value="pins">Exam PINs</option>
                </select>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200" />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200" />
                <div className="flex gap-2">
                    <input type="number" inputMode="decimal" placeholder="Min" value={minAmt} onChange={(e) => setMinAmt(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 w-1/2" />
                    <input type="number" inputMode="decimal" placeholder="Max" value={maxAmt} onChange={(e) => setMaxAmt(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 w-1/2" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="text-left px-4 py-3">Date</th>
                                <th className="text-left px-4 py-3">User</th>
                                <th className="text-left px-4 py-3">Service</th>
                                <th className="text-right px-4 py-3">Amount</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-left px-4 py-3">Reference</th>
                                <th className="text-right px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-slate-500">Loading…</td>
                                </tr>
                            )}
                            {!loading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-slate-500">No transactions</td>
                                </tr>
                            )}
                            {!loading && rows.map((r) => {
                                const userText = typeof r.user === "string"
                                    ? r.user
                                    : (r.user?.email ?? r.user?.name ?? r.user?._id ?? r.userId ?? "");
                                return (
                                    <tr key={r._id} className="border-t border-slate-100">
                                        <td className="px-4 py-3 text-slate-700">{new Date(r.createdAt).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-slate-700">{userText}</td>
                                        <td className="px-4 py-3 text-slate-700 capitalize">{r.service ?? "—"}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-900">{currency(r.amount)}</td>
                                        <td className="px-4 py-3"><StatusTag status={r.status} /></td>
                                        <td className="px-4 py-3 text-slate-700">{r.reference ?? "—"}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button onClick={() => alert(JSON.stringify(r, null, 2))} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg">Details</button>
                                                <button onClick={() => recheck(r.reference)} disabled={!r.reference || (r as any).__checking} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                                                    {(r as any).__checking ? "Checking…" : "Re-check"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                    <div className="text-sm text-slate-600">Total: {total}</div>
                    <div className="flex items-center gap-2">
                        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="px-2 py-1 rounded-lg border border-slate-200 text-sm">
                            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
                        </select>
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg" disabled={page <= 1}>Prev</button>
                        <span className="text-sm">{page} / {totalPages}</span>
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg" disabled={page >= totalPages}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}