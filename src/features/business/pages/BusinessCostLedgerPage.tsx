import React, { useState, useEffect } from 'react';
import { 
    BarChart3, 
    Search, 
    Filter, 
    Download, 
    ChevronLeft, 
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Clock,
    CheckCircle2,
    Database
} from 'lucide-react';
import businessService from '../services/businessService';
import { ListSkeleton } from '../../../components/feedback/Skeletons';
import { toast } from 'react-toastify';

const BusinessCostLedgerPage: React.FC = () => {
    const [ledger, setLedger] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadLedger();
    }, [page]);

    const loadLedger = async () => {
        setLoading(true);
        try {
            const data = await businessService.getCostLedger();
            setLedger(data.items || data || []);
        } catch (err) {
            toast.error("Failed to load cost ledger");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(val || 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Cost Ledger</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Granular transaction margin analysis</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <Search size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Trace reference..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all w-full sm:w-64"
                        />
                    </div>
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Trace Entry</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Service Node</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Input (Cost)</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Output (Sales)</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Delta (Profit)</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={6} className="p-0"><ListSkeleton count={1} /></td></tr>
                                ))
                            ) : ledger.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">No ledger entries found</td>
                                </tr>
                            ) : ledger.map((item, i) => (
                                <tr key={i} className="group hover:bg-white/5 transition-colors text-[13px]">
                                    <td className="px-6 py-4">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-slate-200">{item.type} {item.service}</p>
                                            <p className="text-[10px] font-mono text-slate-500 uppercase">{item.transactionId}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">{item.provider || 'System'}</span>
                                        <p className="text-[10px] text-slate-600 font-bold mt-1 uppercase">{new Date(item.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-400">{formatCurrency(item.costPrice)}</td>
                                    <td className="px-6 py-4 font-bold text-white">{formatCurrency(item.amount)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-emerald-500 font-bold">
                                            <ArrowUpRight size={14} />
                                            {formatCurrency(item.profit)}
                                        </div>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase">Margin: {item.amount ? Math.round((item.profit / item.amount) * 100) : 0}%</p>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-[10px] text-emerald-500/80 uppercase tracking-widest">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <CheckCircle2 size={12} />
                                            {item.status}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Database size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Archive Page {page}</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-lg bg-white/5 text-slate-400 disabled:opacity-30 hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 space-y-2">
                    <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Aggregate Profit Pulse</p>
                    <h4 className="text-xl font-bold text-white tracking-tight">Healthy (+14%)</h4>
                    <div className="flex items-center gap-2 pt-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: '14%' }}></div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default BusinessCostLedgerPage;
