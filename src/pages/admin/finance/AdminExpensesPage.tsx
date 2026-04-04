import React, { useEffect, useState } from 'react';
import { History, Receipt, AlertCircle, Loader2, Plus, Calendar, User, Info, CheckCircle2, FileText } from 'lucide-react';
import { getExpenses, createExpense } from '../../../services/admin/adminBusinessService';

const AdminExpensesPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        category: 'Salary',
        title: '',
        amount: '',
        notes: '',
        vendor: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getExpenses();
            if (response.success) {
                setExpenses(response.data);
            }
        } catch (err) {
            console.error('Failed to load expenses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const res = await createExpense({
                ...formData,
                amount: Number(formData.amount)
            });
            if (res.success) {
                setShowModal(false);
                setFormData({ category: 'Salary', title: '', amount: '', notes: '', vendor: '' });
                fetchData();
            }
        } catch (err) {
            alert('Failed to log expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    const autoExpenses = expenses.filter(e => e.category === 'API_COST');
    const manualExpenses = expenses.filter(e => e.category !== 'API_COST');
    const totalAuto = autoExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalManual = manualExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    if (loading && expenses.length === 0) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Reconciling Accounts...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operational Expenses</h1>
                    <p className="text-slate-500 text-sm mt-1">Track external vendor API fees, corporate overhead, and manual outflows.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                >
                    <Plus size={18} />
                    Log Custom Expense
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                        <History className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800">Automated API Fees</h3>
                        <p className="text-xs text-slate-400 mb-4 font-medium">Synced from vendor purchase costs.</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">₦{totalAuto.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                        <AlertCircle className="text-amber-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800">Manual Expenses</h3>
                        <p className="text-xs text-slate-400 mb-4 font-medium">Hosting, Salary, and Physical Assets.</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">₦{totalManual.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 tracking-tight">Expense Audit Trail</h3>
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Entries</span>
                    </div>
                </div>

                {expenses.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                        {expenses.map((expense) => (
                            <div key={expense._id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${expense.category === 'API_COST' ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-500'}`}>
                                        <Receipt size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 tracking-tight">{expense.title}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <Calendar size={10} />
                                                <span className="text-[10px] font-bold uppercase">{new Date(expense.date).toLocaleDateString()}</span>
                                            </div>
                                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${expense.category === 'API_COST' ? 'text-slate-400' : 'text-rose-500'}`}>{expense.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-lg text-slate-900 tracking-tighter">₦{expense.amount?.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{expense.vendor || 'Internally Logged'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center opacity-30">
                        <History size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="font-black uppercase tracking-widest text-[10px] text-slate-500">No expense records found</p>
                    </div>
                )}
            </div>

            {/* Log Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 pb-4 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Log Manual Expense</h2>
                                <p className="text-xs text-slate-400 font-medium">Record non-automated corporate outflows.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 text-slate-400 flex items-center justify-center transition-all">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Info size={10} /> Category
                                    </label>
                                    <select 
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm font-bold bg-slate-50"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option>Salary</option>
                                        <option>Marketing</option>
                                        <option>Hosting</option>
                                        <option>Utility</option>
                                        <option>Others</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Amount (₦)
                                    </label>
                                    <input 
                                        type="number" 
                                        placeholder="0.00"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm font-bold"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <FileText size={10} /> Expense Title
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. AWS Hosting Fee"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm font-bold"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <User size={10} /> Vendor Name
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Amazon Web Services"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-slate-900 outline-none text-sm font-bold"
                                    value={formData.vendor}
                                    onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                ) : (
                                    <>Commit Entry <Receipt size={16} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminExpensesPage;
