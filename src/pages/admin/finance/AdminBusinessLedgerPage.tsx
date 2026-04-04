import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, FileText, Download, Loader2, AlertCircle, ShoppingCart, Zap, Smartphone, Monitor } from 'lucide-react';
import { getCostLedger } from '../../../services/admin/adminBusinessService';

const AdminBusinessLedgerPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ledger, setLedger] = useState<any[]>([]);

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                setLoading(true);
                const response = await getCostLedger();
                if (response.success) {
                    setLedger(response.data);
                } else {
                    setError(response.message || 'Failed to load ledger data');
                }
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchLedger();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'airtime': return <Smartphone size={20} />;
            case 'data': return <Zap size={20} />;
            case 'electricity': return <Zap size={20} />;
            case 'tv': case 'cable': return <Monitor size={20} />;
            default: return <ShoppingCart size={20} />;
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Compiling Ledger Entries...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cost Ledger</h1>
                    <p className="text-slate-500 text-sm mt-1">Real-time accounting log of internal virtual debits vs credits.</p>
                </div>
                <button 
                    onClick={() => window.location.href = '/api/admin/users/export/csv'} // Reuse export logic if appropriate or implement dedicated
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Financial Transaction Journal</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ledger.length} ENTRIES</span>
                </div>
                
                {ledger.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {ledger.map((txn: any) => (
                            <div key={txn._id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-inner">
                                        {getIcon(txn.type)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 tracking-tight capitalize">{txn.service || txn.type} Purchase</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <FileText size={12} className="text-slate-400" />
                                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">REF: {txn.transactionId}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-lg text-slate-900 leading-tight tracking-tighter">₦{txn.amount?.toLocaleString()}</p>
                                    <div className="flex items-center gap-2 justify-end mt-1">
                                        <span className="text-[10px] font-bold text-rose-500 uppercase">Cost: ₦{txn.costPrice?.toLocaleString()}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Profit: ₦{txn.profit?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] opacity-40">
                        <FileText size={48} className="text-slate-200 mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs text-slate-400">Ledger is currently empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBusinessLedgerPage;
