import React from 'react';
import { 
    X, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Download, 
    Share2, 
    ArrowUpRight, 
    ArrowDownLeft,
    Copy,
    Building2,
    Zap,
    History
} from 'lucide-react';
import { toast } from 'react-toastify';

interface TransactionDetailPanelProps {
    transaction: any;
    onClose: () => void;
}

const TransactionDetailPanel: React.FC<TransactionDetailPanelProps> = ({ transaction, onClose }) => {
    if (!transaction) return null;

    const isCredit = transaction.type === 'credit' || transaction.amount > 0;
    const statusColors = {
        SUCCESS: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        PENDING: 'bg-orange-50 text-orange-600 border-orange-100',
        FAILED: 'bg-red-50 text-red-600 border-red-100',
    };

    const copyRef = (ref: string) => {
        navigator.clipboard.writeText(ref);
        toast.info('Reference copied');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 relative overflow-hidden">
                {/* Abstract Header Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                
                {/* Header */}
                <div className="relative z-10 px-8 py-10 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-800">
                            <History size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ledger Trace</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Metadata Retrieval Active</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400 hover:text-slate-900" />
                    </button>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 overflow-y-auto px-8 py-12 space-y-12">
                    {/* Amount Block */}
                    <div className="text-center space-y-6">
                        <div className={`w-24 h-24 mx-auto rounded-[2.5rem] flex items-center justify-center ${isCredit ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                            {isCredit ? <ArrowDownLeft size={48} strokeWidth={2.5} /> : <ArrowUpRight size={48} strokeWidth={2.5} />}
                        </div>
                        <div className="space-y-2">
                            <h3 className={`text-5xl font-black tracking-tighter ${isCredit ? 'text-emerald-500' : 'text-slate-900'}`}>
                                {isCredit ? '+' : ''}₦{Number(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h3>
                            <div className="flex justify-center">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[transaction.status] || statusColors.PENDING}`}>
                                    {transaction.status || 'PENDING'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="bg-slate-50/50 rounded-[2.5rem] p-10 space-y-8 border border-white">
                        <div className="grid grid-cols-2 gap-y-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Type</p>
                                <p className="font-bold text-slate-900">{transaction.service || 'Wallet Funding'}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway</p>
                                <p className="font-bold text-slate-900">{transaction.gateway || 'Paystack / Wema'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin Date</p>
                                <p className="font-bold text-slate-900">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin Time</p>
                                <p className="font-bold text-slate-900">{new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Reference</p>
                            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 group">
                                <p className="font-mono text-xs font-black text-slate-900 tracking-wider truncate mr-4">
                                    {transaction.reference || 'ZTR-NODE-2024-X920'}
                                </p>
                                <button onClick={() => copyRef(transaction.reference)} className="text-emerald-500 hover:text-emerald-600 transition-colors">
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-start gap-4 p-6 bg-slate-950 rounded-[2rem] text-slate-400">
                        <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-white">Cryptographic Proof</h4>
                            <p className="text-[10px] font-medium leading-relaxed">
                                This transaction has been verified against Zantara's distributed ledger. Use the reference above for support inquiries.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="relative z-10 px-8 py-10 border-t border-slate-50 flex gap-4">
                    <button className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-slate-100 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] text-slate-900 hover:bg-slate-50 transition-all">
                        <Share2 size={16} />
                        <span>Share Proof</span>
                    </button>
                    <button className="flex-[2] inline-flex items-center justify-center gap-2 bg-slate-950 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200">
                        <Download size={16} />
                        <span>Download Statement</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailPanel;
