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
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${map[status]}`}>{status}</span>
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaction Audit</h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm">L3 Ledger: Comprehensive system settlement logs</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={exportCSV} 
                        className="px-5 py-2 bg-slate-950 text-white hover:bg-emerald-500 hover:text-slate-950 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        Export Data
                    </button>
                    <button 
                        onClick={resetFilters} 
                        className="px-5 py-2 bg-white border border-slate-100 text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-50 rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Search</label>
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="User / Ref..." className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm transition-all appearance-none bg-white">
                        <option value="">All Statuses</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Service Type</label>
                    <select value={service} onChange={(e) => setService(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm transition-all appearance-none bg-white">
                        <option value="">All Services</option>
                        <option value="airtime">Airtime</option>
                        <option value="data">Data</option>
                        <option value="electricity">Electricity</option>
                        <option value="cable">Cable</option>
                        <option value="pins">Exam PINs</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">From Date</label>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">To Date</label>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Amount Range</label>
                    <div className="flex gap-2">
                        <input type="number" inputMode="decimal" placeholder="Min" value={minAmt} onChange={(e) => setMinAmt(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm transition-all" />
                        <input type="number" inputMode="decimal" placeholder="Max" value={maxAmt} onChange={(e) => setMaxAmt(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm transition-all" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-400">
                            <tr>
                                <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Date</th>
                                <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Client</th>
                                <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Protocol</th>
                                <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Amount</th>
                                <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Status</th>
                                <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Reference</th>
                                <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-4 text-center text-slate-500">Loading…</td>
                                </tr>
                            )}
                            {!loading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-4 text-center text-slate-500">No transactions</td>
                                </tr>
                            )}
                            {!loading && rows.map((r) => {
                                const userText = typeof r.user === "string"
                                    ? r.user
                                    : (r.user?.email ?? r.user?.name ?? r.user?._id ?? r.userId ?? "");
                                return (
                                    <tr key={r._id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-2.5 text-slate-500 font-medium whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                                        <td className="px-4 py-2.5 text-slate-900 font-semibold">{userText}</td>
                                        <td className="px-4 py-2.5 text-slate-500 font-bold uppercase text-[10px] tracking-widest">{r.service ?? "—"}</td>
                                        <td className="px-4 py-2.5 text-right font-bold text-slate-900">{currency(r.amount)}</td>
                                        <td className="px-4 py-2.5"><StatusTag status={r.status} /></td>
                                        <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{r.reference ?? "—"}</td>
                                        <td className="px-4 py-2.5 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button onClick={() => alert(JSON.stringify(r, null, 2))} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 transition-all">Details</button>
                                                <button onClick={() => recheck(r.reference)} disabled={!r.reference || (r as any).__checking} className="px-3 py-1.5 bg-slate-950 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider disabled:opacity-50 hover:bg-emerald-500 hover:text-slate-950 transition-all">
                                                    {(r as any).__checking ? "Checking…" : "Trace"}
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