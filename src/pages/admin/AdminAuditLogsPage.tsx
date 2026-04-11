import React, { useState, useEffect, useCallback } from 'react';
import { 
    Shield, 
    Search, 
    Download, 
    ChevronLeft, 
    ChevronRight,
    Clock,
    User,
    RefreshCcw,
    Filter,
    X,
    CheckCircle2,
    XCircle,
    ChevronDown,
    FileText
} from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import { toast } from 'react-hot-toast';

const ACTION_TYPES = [
    'All Actions',
    'SETTING_UPDATE',
    'COMMISSION_SETTING_UPDATE',
    'USER_COMMISSION_OVERRIDE',
    'AGENT_SETTING_UPDATE',
    'COMMISSION_CAP_UPDATE',
    'PAYOUT_TRIGGERED',
    'USER_ROLE_UPDATE',
    'WALLET_CREDIT',
    'WALLET_DEBIT',
];

const LIMIT_OPTIONS = [20, 50, 100];

const AdminAuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('All Actions');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [showFilters, setShowFilters] = useState(false);

    const loadLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { page, limit };
            if (search) params.search = search;
            if (actionFilter !== 'All Actions') params.search = actionFilter;

            const res = await apiClient.get('/admin/audit-logs', { params });
            setLogs(res.data?.data || []);
            setPagination(res.data?.pagination || { total: 0, pages: 1 });
        } catch (err) {
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, actionFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => loadLogs(), 350);
        return () => clearTimeout(debounce);
    }, [loadLogs]);

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const handleActionChange = (val: string) => {
        setActionFilter(val);
        setPage(1);
    };

    const handleReset = () => {
        setSearch('');
        setActionFilter('All Actions');
        setPage(1);
        setLimit(50);
    };

    const getActionStyle = (action: string) => {
        if (action?.includes('DELETE') || action?.includes('DEBIT'))  return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (action?.includes('CREATE') || action?.includes('CREDIT')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (action?.includes('UPDATE') || action?.includes('OVERRIDE')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (action?.includes('TRIGGER') || action?.includes('PAYOUT')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    const hasActiveFilters = search || actionFilter !== 'All Actions' || limit !== 50;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight italic">System Audit Trail</h1>
                    <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] mt-1 uppercase">
                        Every administrative action, immutably recorded
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadLogs}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            showFilters || hasActiveFilters
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                    >
                        <Filter size={14} />
                        Filters
                        {hasActiveFilters && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[8px] flex items-center justify-center font-black">!</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Controls</span>
                        {hasActiveFilters && (
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 text-[9px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300 transition-colors"
                            >
                                <X size={12} /> Reset All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Operator or action..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium placeholder:text-slate-600"
                            />
                        </div>

                        {/* Action Type */}
                        <div className="relative">
                            <select
                                value={actionFilter}
                                onChange={(e) => handleActionChange(e.target.value)}
                                className="w-full appearance-none bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium cursor-pointer"
                            >
                                {ACTION_TYPES.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>

                        {/* Per Page */}
                        <div className="relative">
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="w-full appearance-none bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium cursor-pointer"
                            >
                                {LIMIT_OPTIONS.map(l => (
                                    <option key={l} value={l}>{l} per page</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Bar */}
            <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                    <FileText size={12} className="text-emerald-500" />
                    {pagination.total.toLocaleString()} total entries
                </span>
                <span className="text-slate-700">•</span>
                <span>Page {page} of {pagination.pages}</span>
                {hasActiveFilters && (
                    <>
                        <span className="text-slate-700">•</span>
                        <span className="text-emerald-500">Filters active</span>
                    </>
                )}
            </div>

            {/* Table */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-950/50 border-b border-white/5">
                                <th className="px-5 py-3.5 text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Timestamp</th>
                                <th className="px-5 py-3.5 text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Operator</th>
                                <th className="px-5 py-3.5 text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Action</th>
                                <th className="px-5 py-3.5 text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Scope / Target</th>
                                <th className="px-5 py-3.5 text-right text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                Array(8).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4"><div className="h-3 bg-white/5 rounded w-32" /></td>
                                        <td className="px-5 py-4"><div className="h-3 bg-white/5 rounded w-24" /></td>
                                        <td className="px-5 py-4"><div className="h-3 bg-white/5 rounded w-36" /></td>
                                        <td className="px-5 py-4"><div className="h-3 bg-white/5 rounded w-28" /></td>
                                        <td className="px-5 py-4"><div className="h-3 bg-white/5 rounded w-16 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-600">
                                            <Shield size={36} className="opacity-30" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No audit entries match your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.map((log, i) => (
                                <tr key={i} className="group hover:bg-white/[0.03] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock size={11} className="shrink-0" />
                                            <span className="text-xs font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                                <User size={12} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-200 leading-none">{log.operatorName || log.operatorId || 'System'}</p>
                                                <p className="text-[9px] font-mono text-slate-600 mt-0.5 truncate max-w-[120px]">{log.ipAddress || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="space-y-1">
                                            <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getActionStyle(log.action)}`}>
                                                {log.action}
                                            </span>
                                            <p className="text-[9px] text-slate-600 truncate max-w-[200px] font-mono">{log.userAgent?.split(' ')[0] || 'System Process'}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500 font-mono text-[10px]">
                                        {log.target || 'GLOBAL_SCOPE'}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        {log.result === 'success' || !log.result ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                <CheckCircle2 size={10} /> Success
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
                                                <XCircle size={10} /> {log.result}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-white/5 bg-slate-950/30">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total}
                        </span>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                                let pageNum: number;
                                const total = pagination.pages;
                                if (total <= 7) pageNum = i + 1;
                                else if (page <= 4) pageNum = i + 1;
                                else if (page >= total - 3) pageNum = total - 6 + i;
                                else pageNum = page - 3 + i;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${
                                            pageNum === page
                                                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                                                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAuditLogsPage;
