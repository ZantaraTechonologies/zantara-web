import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../../services/api/apiClient";
import { 
    Search, 
    Filter, 
    RefreshCw, 
    Download, 
    Smartphone, 
    Globe, 
    Zap, 
    Tv, 
    PlusCircle, 
    MinusCircle, 
    Activity,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    ArrowUpRight,
    Loader2,
    XCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

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
    transactionId?: string; // system ID
    refId?: string; // fallback ID
    type?: string; // e.g., funding, purchase, Commission
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
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<Txn[]>([]);
    const [total, setTotal] = useState(0);

    // Get userId from URL if coming from User Detail
    const queryParams = new URLSearchParams(location.search);
    const [userIdFilter, setUserIdFilter] = useState(queryParams.get('userId') || "");

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

    const getTransactionConfig = (type: string) => {
        switch (type) {
            case 'funding':
            case 'credit':
            case 'settlement':
                return { icon: <PlusCircle size={14} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Wallet Funding' };
            case 'data':
                return { icon: <Globe size={14} />, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Data Purchase' };
            case 'airtime':
                return { icon: <Smartphone size={14} />, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Airtime Purchase' };
            case 'tv':
            case 'cable':
                return { icon: <Tv size={14} />, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'TV Subscription' };
            case 'electricity':
                return { icon: <Zap size={14} />, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Utility Bill' };
            case 'withdrawal':
            case 'expense':
                return { icon: <MinusCircle size={14} />, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Withdrawal' };
            default:
                return { icon: <Activity size={14} />, color: 'text-slate-400', bg: 'bg-slate-100', label: String(type || 'UNKNOWN').toUpperCase() };
        }
    };

    const debouncedQ = useDebounce(q, 400);
    async function fetchData() {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, limit };
            if (debouncedQ) params.search = debouncedQ;
            if (status) params.status = status;
            if (service) params.service = service;
            if (from) params.from = from;
            if (to) params.to = to;
            if (minAmt) params.minAmount = Number(minAmt);
            if (maxAmt) params.maxAmount = Number(maxAmt);
            if (userIdFilter) params.userId = userIdFilter;

            const response = await API.get("/transaction-logs/admin/transactions/all", { params });
            const result = response.data.data;
            setRows(result.transactions || []);
            setTotal(result.pagination?.total || 0);
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch transactions");
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
        setUserIdFilter("");
        setPage(1);
        navigate('/admin/transactions', { replace: true });
    }

    async function recheck(reference?: string, transactionId?: string, refId?: string) {
        const targetRef = reference || transactionId || refId;
        if (!targetRef) return;
        
        const prev = rows.slice();
        try {
            const idx = rows.findIndex((r) => r.reference === reference || r.transactionId === transactionId || r.refId === refId);
            if (idx >= 0) {
                const copy = rows.slice();
                (copy[idx] as any).__checking = true;
                setRows(copy);
            }
            await API.post("/services/transaction/status", { reference: targetRef });
            await fetchData();
        } catch (e) {
            console.error(e);
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
            typeof r.user === "string" ? r.user : (r.user?.email ?? r.user?.name ?? (typeof r.userId === 'object' ? (r.userId as any)?.email || (r.userId as any)?.name : r.userId) ?? ""),
            r.service ?? "",
            String(r.amount),
            r.status,
            r.transactionId || r.refId || r.reference || "",
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
                        <option value="funding">Wallet Funding</option>
                        <option value="airtime">Airtime</option>
                        <option value="data">Data</option>
                        <option value="electricity">Electricity</option>
                        <option value="cable">Cable</option>
                        <option value="commission">Commissions</option>
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
                                const typeOrService = (r.type || r.service || 'data').toLowerCase();
                                const config = getTransactionConfig(typeOrService);
                                const isCredit = ['funding', 'credit', 'settlement', 'referral_bonus', 'commission'].includes(typeOrService);
                                
                                const userText = typeof r.user === "string" 
                                    ? r.user 
                                    : (r.user?.email ?? r.user?.name ?? (typeof r.userId === 'object' ? (r.userId as any)?.email || (r.userId as any)?.name : r.userId) ?? "Unknown User");

                                return (
                                    <tr key={r._id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                                <span className="text-[10px] text-slate-400 font-medium uppercase">{new Date(r.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <User size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{userText}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">CLIENT_NODE</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 rounded-lg ${config.bg} ${config.color} flex items-center justify-center`}>
                                                    {config.icon}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700 capitalize">{r.service}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{config.label}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-4 py-3 text-right font-bold text-sm ${isCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {isCredit ? '+' : '-'}{currency(r.amount || 0).replace('NGN', '₦')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                                r.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                                                r.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-mono text-slate-400 select-all">{r.transactionId || r.refId || r.reference?.slice(0, 12) || "—"}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <button 
                                                    onClick={() => recheck(r.reference, r.transactionId, r.refId)} 
                                                    disabled={(!r.reference && !r.transactionId && !r.refId) || (r as any).__checking}
                                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-500 transition-all disabled:opacity-30"
                                                    title="Trace Transaction"
                                                >
                                                    <RefreshCw size={14} className={(r as any).__checking ? "animate-spin" : ""} />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/admin/transactions/${r._id}`)}
                                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all"
                                                    title="Deep Audit"
                                                >
                                                    <ArrowUpRight size={14} />
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
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Total Audit Units: {total.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-4">
                        <select 
                            value={limit} 
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} 
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] font-bold uppercase tracking-wider bg-white outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        >
                            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} Per Page</option>)}
                        </select>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))} 
                                disabled={page <= 1}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest min-w-[80px] text-center">
                                {page} of {totalPages}
                            </span>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                                disabled={page >= totalPages}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}