import React, { useState, useEffect } from 'react';
import { useBusinessStore } from '../store/businessStore';
import { 
    Plus, 
    Receipt, 
    Trash2, 
    Calendar, 
    Filter, 
    Search,
    ArrowUpRight,
    Tag,
    X
} from 'lucide-react';
import { ListSkeleton } from '../../../components/feedback/Skeletons';
import { toast } from 'react-toastify';

const BusinessExpenses: React.FC = () => {
    const { expenses, loading, fetchExpenses, addExpense } = useBusinessStore();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'operational',
        vendor: '',
        paymentSource: 'Bank Transfer',
        notes: ''
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(val || 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addExpense({
                title: formData.title,
                amount: parseFloat(formData.amount),
                category: formData.category,
                vendor: formData.vendor,
                paymentSource: formData.paymentSource,
                notes: formData.notes
            });
            setFormData({ title: '', amount: '', category: 'operational', vendor: '', paymentSource: 'Bank Transfer', notes: '' });
            setShowModal(false);
            toast.success("Expense logged successfully");
        } catch (err) {
            toast.error("Failed to log expense");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Expenses Ledger</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Track operational costs & manual outflows</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 rounded-2xl text-[10px] font-bold text-slate-950 uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10"
                >
                    <Plus size={16} />
                    Record Outflow
                </button>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Trace</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Title / Vendor</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Source</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="p-0"><ListSkeleton count={1} /></td></tr>
                                ))
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                                        No expense entries detected
                                    </td>
                                </tr>
                            ) : (
                                (expenses || []).map((exp: any) => (
                                    <tr key={exp._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 group-hover:text-emerald-500 transition-colors">
                                                    <Receipt size={16} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-slate-200">{exp.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{exp.vendor || 'Platform'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${
                                                exp.category === 'operational' 
                                                ? 'bg-blue-500/5 text-blue-500 border-blue-500/10' 
                                                : 'bg-purple-500/5 text-purple-500 border-purple-500/10'
                                            }`}>
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-white tracking-tight">{formatCurrency(exp.amount)}</td>
                                        <td className="px-6 py-5">
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exp.paymentSource || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                                <Calendar size={12} />
                                                {exp.date ? new Date(exp.date).toLocaleDateString() : 'Now'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Record Outflow</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manual cost injection</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entry Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Server maintenance"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-bold placeholder:text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vendor / Recipient</label>
                                    <input 
                                        type="text" 
                                        value={formData.vendor}
                                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                        placeholder="e.g. AWS Nigeria"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-bold placeholder:text-slate-700"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount (₦)</label>
                                        <input 
                                            type="number" 
                                            required
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-bold placeholder:text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                                        <select 
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="operational">Operational</option>
                                            <option value="manual">Manual</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="submit"
                                className="w-full py-5 bg-emerald-500 rounded-2xl font-black text-slate-950 uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all mt-4"
                            >
                                Commit Outflow
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessExpenses;
