import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    ChevronRight, 
    Download,
    Calendar,
    Wallet,
    Phone,
    Wifi,
    Zap,
    Tv,
    GraduationCap,
    Clock,
    Info,
    RefreshCw,
    ChevronLeft
} from 'lucide-react';
import { useMyTransactions } from '../../hooks/useWallet';
import { useWalletStore } from '../../store/wallet/walletStore';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const getServiceIcon = (type: string) => {
    switch (type) {
        case 'wallet_fund': return <Wallet size={16} className="text-blue-500" />;
        case 'airtime': return <Phone size={16} className="text-emerald-500" />;
        case 'data': return <Wifi size={16} className="text-purple-500" />;
        case 'electricity': return <Zap size={16} className="text-orange-500" />;
        case 'cable': return <Tv size={16} className="text-red-500" />;
        case 'exam_pin': return <GraduationCap size={16} className="text-indigo-500" />;
        default: return <Info size={16} className="text-slate-400" />;
    }
};

const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'success' || s === 'completed') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'pending' || s === 'processing') return 'bg-amber-50 text-amber-600 border-amber-100';
    if (s === 'failed' || s === 'error') return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-slate-50 text-slate-500 border-slate-100';
};

const UserTransactionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const limit = 10;

    const { currency } = useWalletStore();
    const { data, isLoading, refetch, isPlaceholderData } = useMyTransactions({
        page,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
        refId: searchQuery || undefined
    });

    const transactions = data?.items || [];
    const totalItems = data?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const handleExport = () => {
        if (!transactions.length) {
            toast.error('No transactions to export');
            return;
        }
        const headers = ['Date', 'Service', 'Reference', 'Amount', 'Status'];
        const csvRows = transactions.map(tx => [
            format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm'),
            tx.service || tx.type,
            tx.refId,
            `${currency}${tx.amount}`,
            tx.status
        ].join(','));
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zantara_ledger_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Financial ledger exported');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 sm:px-0">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Financial Ledger</h1>
                    <p className="text-sm text-slate-500 font-medium">Systematic record of all node operations</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => { refetch(); toast.success('Ledger synchronized'); }}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-500 transition-colors shadow-sm active:scale-95"
                        title="Sync Ledger"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-lg active:scale-95"
                    >
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by reference code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-4">
                        <select 
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                        <select 
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                            className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                        >
                            <option value="all">All Services</option>
                            <option value="wallet_fund">Funding</option>
                            <option value="airtime">Airtime</option>
                            <option value="data">Data</option>
                            <option value="electricity">Electricity</option>
                            <option value="cable">Cable TV</option>
                            <option value="exam_pin">Exam PIN</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset / Service</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Reference ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Settlement</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Result</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-5"><div className="h-5 bg-slate-100 rounded w-32"></div></td>
                                        <td className="px-6 py-5 hidden md:table-cell"><div className="h-4 bg-slate-50 rounded w-24"></div></td>
                                        <td className="px-6 py-5 hidden sm:table-cell"><div className="h-4 bg-slate-50 rounded w-20"></div></td>
                                        <td className="px-6 py-5"><div className="h-5 bg-slate-100 rounded w-16"></div></td>
                                        <td className="px-6 py-5"><div className="h-6 bg-slate-50 rounded-lg w-20"></div></td>
                                        <td className="px-6 py-5 text-right"><div className="h-8 w-8 bg-slate-100 rounded-full ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                                    {getServiceIcon(tx.type)}
                                                </div>
                                                <span className="font-bold text-slate-900 text-sm truncate max-w-[120px] md:max-w-none">
                                                    {tx.service || tx.type.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 hidden md:table-cell">
                                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">{tx.refId || '-------'}</span>
                                        </td>
                                        <td className="px-6 py-5 hidden sm:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700">{format(new Date(tx.createdAt), 'MMM dd, yyyy')}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{format(new Date(tx.createdAt), 'HH:mm')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-sm font-black tracking-tight ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                {tx.amount > 0 ? '+' : ''}{currency}{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${getStatusStyles(tx.status)}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button 
                                                onClick={() => navigate(`/app/transactions/${tx.id}`)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-100 text-slate-300 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm group-hover:scale-110 active:scale-95"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-none hover:bg-transparent">
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                                                <Clock size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 uppercase">No records found</h3>
                                                <p className="text-sm text-slate-500 font-medium">Clear search or filters to re-index ledger.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Showing Page <span className="text-slate-900">{page}</span> of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={page === 1 || isLoading}
                                onClick={() => setPage(p => p - 1)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                            >
                                <ChevronLeft size={14} />
                                <span>Previous</span>
                            </button>
                            <button 
                                disabled={page === totalPages || isLoading}
                                onClick={() => setPage(p => p + 1)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                            >
                                <span>Next</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserTransactionsPage;

