import React, { useEffect, useState, useCallback } from 'react';
import { 
    Receipt, 
    ArrowUpRight, 
    Zap, 
    Smartphone, 
    Monitor, 
    ShoppingCart, 
    Download, 
    Loader2, 
    AlertCircle, 
    History, 
    Plus, 
    Calendar, 
    User, 
    Info, 
    Search, 
    RefreshCcw, 
    ChevronLeft, 
    ChevronRight, 
    Clock 
} from 'lucide-react';
import { getCostLedger, getExpenses, createExpense } from '../../../../services/admin/adminBusinessService';
import { toast } from 'react-hot-toast';

interface Props {
    period: string;
    customDates: { start: string; end: string };
}

const TreasuryLedgerTab: React.FC<Props> = ({ period, customDates }) => {
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // Data state
    const [masterLedger, setMasterLedger] = useState<any[]>([]);
    const [view, setView] = useState<'all' | 'auto' | 'manual'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Form state
    const [formData, setFormData] = useState({
        category: 'Salary',
        title: '',
        amount: '',
        notes: '',
        vendor: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {};
            const now = new Date();

            if (period === 'this-month') {
                params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            } else if (period === 'last-30-days') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(now.getDate() - 30);
                params.startDate = thirtyDaysAgo.toISOString().split('T')[0];
            } else if (period === 'custom') {
                params.startDate = customDates.start;
                params.endDate = customDates.end;
            }
            
            const [ledgerRes, expenseRes] = await Promise.all([
                getCostLedger(params),
                getExpenses(params)
            ]);

            const normalizedLedger = (ledgerRes.data || []).map((t: any) => ({
                ...t,
                source: t.type === 'dividend_credit' ? 'manual' : 'auto',
                displayDate: new Date(t.createdAt || Date.now()),
                displayTitle: t.type === 'dividend_credit' ? `Dividend Payout` : `${t.service || t.type || 'Service'} Purchase Cost`,
                displayUser: t.type === 'dividend_credit' ? 'Shareholders' : (t.user?.fullName || 'System'),
                displayAmount: t.type === 'dividend_credit' ? (t.amount || 0) : (t.costPrice || 0),
                displayCategory: t.type
            }));

            const normalizedExpenses = (expenseRes.data || []).map((e: any) => ({
                ...e,
                source: 'manual',
                displayDate: new Date(e.date || e.createdAt || Date.now()),
                displayTitle: e.title || 'Untitled Expense',
                displayUser: e.vendor || 'Internal',
                displayAmount: e.amount || 0,
                displayCategory: e.category || 'General'
            }));

            const combined = [...normalizedLedger, ...normalizedExpenses].sort(
                (a, b) => (b.displayDate?.getTime() || 0) - (a.displayDate?.getTime() || 0)
            );

            setMasterLedger(combined);
            setCurrentPage(1);
        } catch (err: any) {
            toast.error(err.message || "Failed to synchronize treasury ledger");
        } finally {
            setLoading(false);
        }
    }, [period, customDates]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const res = await createExpense({
                ...formData,
                amount: Number(formData.amount)
            });
            if (res.success) {
                toast.success("Operational expense logged successfully");
                setShowModal(false);
                setFormData({ category: 'Salary', title: '', amount: '', notes: '', vendor: '' });
                fetchData();
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to commit expense node');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredLedger = masterLedger.filter(item => {
        const matchesView = view === 'all' || item.source === view;
        const search = searchTerm.toLowerCase();
        const matchesSearch = (item.displayTitle?.toLowerCase() || '').includes(search) || 
                             (item.displayUser?.toLowerCase() || '').includes(search);
        return matchesView && matchesSearch;
    });

    const totalPages = Math.ceil(filteredLedger.length / pageSize);
    const paginatedLedger = filteredLedger.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalOutflow = masterLedger.reduce((sum, item) => sum + (item.displayAmount || 0), 0);
    const autoOutflow = masterLedger.filter(i => i.source === 'auto').reduce((sum, item) => sum + (item.displayAmount || 0), 0);
    const manualOutflow = masterLedger.filter(i => i.source === 'manual').reduce((sum, item) => sum + (item.displayAmount || 0), 0);

    const getIcon = (item: any) => {
        if (item.source === 'manual') return <Receipt size={16} />;
        switch (item.displayCategory) {
            case 'airtime': return <Smartphone size={16} />;
            case 'data': case 'electricity': return <Zap size={16} />;
            case 'tv': case 'cable': return <Monitor size={16} />;
            default: return <ShoppingCart size={16} />;
        }
    };

    if (loading && masterLedger.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Reconciling Master Ledger...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <History size={200} className="absolute top-[-20px] right-[-20px] opacity-5 text-white group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 text-center lg:text-left">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Period Outflow Sum</p>
                        <h2 className="text-4xl font-black text-white tracking-tighter italic mb-4">₦{totalOutflow.toLocaleString()}</h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[9px] font-bold uppercase">Treasury Impact</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <Zap size={200} className="absolute top-[-20px] right-[-20px] opacity-10 text-blue-500 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 text-center lg:text-left">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Service Inventory Cost</p>
                        <h2 className="text-4xl font-black text-white tracking-tighter italic mb-4">₦{autoOutflow.toLocaleString()}</h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase">Automated Direct Cost</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <User size={200} className="absolute top-[-20px] right-[-20px] opacity-10 text-rose-500 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 text-center lg:text-left">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Period Overhead</p>
                        <h2 className="text-4xl font-black text-white tracking-tighter italic mb-4">₦{manualOutflow.toLocaleString()}</h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold uppercase">Manual Expenses</div>
                    </div>
                </div>
            </div>

            {/* Controller Bar */}
            <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl flex flex-col xl:flex-row items-center gap-6">
                <div className="flex bg-slate-950 p-1 rounded-2xl shrink-0 overflow-x-auto no-scrollbar">
                    {(['all', 'auto', 'manual'] as const).map((v) => (
                        <button key={v} onClick={() => setView(v)} className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === v ? "bg-white text-slate-950 shadow-lg" : "text-slate-500 hover:text-white"}`}>{v === 'all' ? 'Unified Stream' : v === 'auto' ? 'Services' : 'Overhead'}</button>
                    ))}
                </div>
                <div className="flex-1 relative w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} /><input type="text" placeholder="Scan ledger..." className="w-full h-14 bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-6 text-sm text-white outline-none focus:border-white/20 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <button onClick={() => setShowModal(true)} className="px-6 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 transition-all flex items-center gap-2 shadow-xl shadow-rose-600/20 active:scale-95"><Plus size={16} /> Log Expense</button>
            </div>

            {/* Master Table */}
            <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead><tr className="bg-slate-950/50 border-b border-white/5"><th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Detail</th><th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase text-center">Source</th><th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase">Timestamp</th><th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase text-right">Impact</th></tr></thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedLedger.map((item) => (
                                <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.source === 'auto' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>{getIcon(item)}</div><div><p className="font-bold text-white tracking-tight text-sm italic">{item.displayTitle}</p><p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">REF: {item.transactionId || item._id?.toString().slice(-8)}</p></div></div></td>
                                    <td className="px-6 py-6 text-center"><span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${item.source === 'auto' ? "bg-blue-500/20 text-blue-400" : "bg-rose-500/20 text-rose-400"}`}>{item.source === 'auto' ? 'Srvc' : 'Overhd'}</span></td>
                                    <td className="px-6 py-6 border-transparent"><div className="space-y-1"><div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase"><Calendar size={12} className="text-slate-600" /> {item.displayDate.toLocaleDateString()}</div><div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase"><User size={12} className="text-slate-700" /> {item.displayUser}</div></div></td>
                                    <td className="px-8 py-6 text-right"><p className="text-lg font-black text-white tracking-tighter tabular-nums mb-1 group-hover:text-rose-400 transition-colors">₦{item.displayAmount?.toLocaleString()}</p><p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Verified Audit</p></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="px-8 py-6 border-t border-white/5 bg-slate-950/30 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Page {currentPage} / {totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center disabled:opacity-30"><ChevronLeft size={18} /></button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center disabled:opacity-30"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-10 pb-6 border-b border-white/5 flex items-center justify-between">
                            <div><h2 className="text-3xl font-black italic text-white tracking-tighter">Commit Outflow</h2><p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Manual Treasury Entry</p></div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-full hover:bg-white/5 text-slate-500 flex items-center justify-center transition-all active:scale-95"><Plus className="rotate-45" size={32} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label><select className="w-full h-14 px-6 rounded-2xl bg-slate-950 border border-white/5 outline-none text-sm font-bold text-white transition-all cursor-pointer" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}><option>Salary</option><option>Marketing</option><option>Hosting</option><option>Utility</option><option>Office</option><option>Legal</option><option>Others</option></select></div>
                                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₦)</label><input type="number" placeholder="0.00" className="w-full h-14 px-6 rounded-2xl bg-slate-950 border border-white/5 outline-none text-sm font-black text-white" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required /></div>
                            </div>
                            <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expenditure Title</label><input type="text" placeholder="e.g. Server Maintenance" className="w-full h-14 px-6 rounded-2xl bg-slate-950 border border-white/5 outline-none text-sm font-black text-white" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
                            <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipient / Vendor</label><input type="text" placeholder="Who was paid?" className="w-full h-14 px-6 rounded-2xl bg-slate-950 border border-white/5 outline-none text-sm font-black text-white" value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} /></div>
                            <button type="submit" disabled={isSubmitting} className="w-full h-16 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98]">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Commit Outflow Journal <Receipt size={18} /></>}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TreasuryLedgerTab;
