import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Filter, 
    ChevronRight, 
    ArrowLeft,
    Download,
    Calendar,
    Wallet,
    Phone,
    Wifi,
    Zap,
    Tv,
    GraduationCap,
    Clock,
    CheckCircle2,
    XCircle,
    Info,
    RefreshCw
} from 'lucide-react';
import { useMyTransactions } from '../../hooks/useWallet';
import { TxLog } from '../../services/transactions/transactionService';

const getServiceIcon = (type: string) => {
    switch (type) {
        case 'wallet_fund': return <Wallet className="text-blue-500" />;
        case 'airtime': return <Phone className="text-emerald-500" />;
        case 'data': return <Wifi className="text-purple-500" />;
        case 'electricity': return <Zap className="text-orange-500" />;
        case 'cable': return <Tv className="text-red-500" />;
        case 'exam_pin': return <GraduationCap className="text-indigo-500" />;
        default: return <Info className="text-slate-400" />;
    }
};

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'failed': return 'bg-red-50 text-red-600 border-red-100';
        default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
};

const UserTransactionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const { data, isLoading, refetch } = useMyTransactions({
        limit: 100 // High limit for initial view
    });

    const filteredTransactions = useMemo(() => {
        if (!data?.items) return [];
        return data.items.filter(tx => {
            const matchesSearch = !searchQuery || 
                tx.refId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tx.service?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
            const matchesType = typeFilter === 'all' || tx.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [data, searchQuery, statusFilter, typeFilter]);

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Ledger</h1>
                    <p className="text-sm text-slate-500 font-medium">Keep track of every transaction on your account</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => refetch()}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 hover:text-slate-950 transition-all shadow-xl shadow-slate-200">
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by reference or service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    <select 
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
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

            {/* Transactions List */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-50">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="p-6 flex items-center gap-4 animate-pulse">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                                    <div className="h-3 bg-slate-50 rounded w-1/3"></div>
                                </div>
                                <div className="h-6 bg-slate-100 rounded w-20"></div>
                            </div>
                        ))
                    ) : filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx) => (
                            <button 
                                key={tx.id}
                                onClick={() => navigate(`/app/transactions/${tx.id}`)}
                                className="w-full p-6 flex items-center gap-5 hover:bg-slate-50 transition-colors group text-left"
                            >
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                    {getServiceIcon(tx.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                        <span className="truncate">{tx.service || tx.type.replace('_', ' ').toUpperCase()}</span>
                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md border ${getStatusStyles(tx.status)}`}>
                                            {tx.status}
                                        </span>
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.2">
                                            <Calendar size={10} />
                                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Unknown date'}
                                        </p>
                                        <p className="text-[10px] text-slate-300 font-bold">•</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                                            {tx.refId || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`text-lg font-black tracking-tight ${tx.amount > 0 ? 'text-slate-900' : 'text-slate-900'}`}>
                                        ₦{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">NGN</p>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                                <Clock size={40} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">No transactions found</h3>
                                <p className="text-sm text-slate-500 font-medium">Try adjusting your filters or search query</p>
                            </div>
                            {(statusFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
                                <button 
                                    onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearchQuery(''); }}
                                    className="text-xs font-bold text-emerald-500 uppercase tracking-widest hover:text-emerald-600"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Placeholder */}
            {filteredTransactions.length > 0 && (
                <div className="flex items-center justify-center pt-4">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Showing {filteredTransactions.length} results</p>
                </div>
            )}
        </div>
    );
};

export default UserTransactionsPage;
