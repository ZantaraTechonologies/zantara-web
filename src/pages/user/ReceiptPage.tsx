import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Printer, 
    Share2, 
    ShieldCheck, 
    ShieldCheck as Safe,
    Clock,
    XCircle,
    RefreshCw
} from 'lucide-react';
import { useTransactionDetails } from '../../hooks/useWallet';
import { useWalletStore } from '../../store/wallet/walletStore';

const ReceiptPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: tx, isLoading, error } = useTransactionDetails(id);
    const { currency } = useWalletStore();

    // Auto-open print dialog if requested via query param (optional)
    useEffect(() => {
        if (tx && !isLoading) {
            // setTimeout(() => window.print(), 1000);
        }
    }, [tx, isLoading]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <RefreshCw size={32} className="text-emerald-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forging Digital Receipt...</p>
            </div>
        );
    }

    if (error || !tx) {
        return (
            <div className="max-w-md mx-auto text-center py-20">
                <XCircle size={48} className="text-red-500 mx-auto" />
                <h2 className="text-xl font-bold text-slate-900 mt-4">Receipt Error</h2>
                <p className="text-slate-500 text-sm mt-2">Could not load the receipt for this transaction.</p>
                <button onClick={() => navigate(-1)} className="mt-6 text-emerald-500 font-bold uppercase text-xs tracking-widest">Go Back</button>
            </div>
        );
    }

    const printReceipt = () => {
        window.print();
    };

    return (
        <div className="max-w-lg mx-auto py-8 px-4 font-sans">
            {/* Action Bar (Hidden on Print) */}
            <div className="flex items-center justify-between mb-8 print:hidden">
                <button 
                    onClick={() => navigate(`/app/transactions/${id}`)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={printReceipt}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 hover:text-slate-900 shadow-sm transition-all"
                        title="Print / Save as PDF"
                    >
                        <Printer size={20} />
                    </button>
                    <button 
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-600 hover:text-slate-900 shadow-sm transition-all"
                        title="Share Receipt"
                    >
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* Receipt Content */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden print:shadow-none print:border-none print:p-0">
                {/* Visual Branding Decor */}
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-950"></div>
                
                {/* Content */}
                <div className="space-y-10 text-center">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                             <div className="bg-slate-950 text-white p-2.5 rounded-xl">
                                <ShieldCheck size={24} />
                             </div>
                             <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">Zantara</span>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Transaction Receipt</h2>
                            <p className="text-xs font-bold text-slate-400">Issued on {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="py-8 border-y border-dashed border-slate-200 space-y-2">
                         <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Value</p>
                         <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                            {currency}{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                         </h1>
                         <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                         }`}>
                             {tx.status === 'success' ? <ShieldCheck size={10} /> : <Clock size={10} />}
                             {tx.status}
                         </div>
                    </div>

                    <div className="space-y-6 text-left">
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service</p>
                                <p className="text-sm font-bold text-slate-900">{tx.service || tx.type.replace('_', ' ').toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm font-bold text-slate-900 capitalize">{tx.status}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                                <p className="text-sm font-bold text-slate-900 font-sans">{new Date(tx.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Currency</p>
                                <p className="text-sm font-bold text-slate-900">{tx.currency || 'NGN'}</p>
                            </div>
                        </div>

                         <div className="bg-slate-50/50 p-5 rounded-2xl space-y-1 border border-slate-100 group">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction Reference</p>
                            <p className="text-sm font-bold text-slate-900 break-all family-mono tracking-tight">{tx.refId || tx.id}</p>
                        </div>
                    </div>

                    <div className="pt-8 space-y-6">
                        <div className="flex flex-col items-center justify-center gap-3">
                             <Safe size={32} className="text-slate-200" />
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
                                Officially Verified Digital Manifest
                             </p>
                        </div>
                        
                        <div className="text-[9px] text-slate-300 font-medium px-8 text-center leading-relaxed">
                            This is a computer-generated receipt for your transaction on Zantara. For inquiries, please contact support@zantara.com
                        </div>
                    </div>
                </div>

                {/* Print Styles */}
                <style>{`
                    @media print {
                        body { background: white !important; }
                        .no-print { display: none !important; }
                        @page { margin: 0; }
                        body { margin: 1.6cm; }
                    }
                `}</style>
            </div>
            
            <div className="mt-8 text-center print:hidden">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">End of Record</p>
            </div>
        </div>
    );
};

export default ReceiptPage;
