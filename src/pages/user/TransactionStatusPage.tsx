import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ArrowLeft, 
    Share2, 
    Download,
    ChevronRight,
    ShieldCheck,
    Info
} from 'lucide-react';
import { useWalletStore } from '../../store/wallet/walletStore';
import { toast } from 'react-hot-toast';

const TransactionStatusPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { status, transaction, message } = location.state || {};
    const { currency } = useWalletStore();

    if (!status || !transaction) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <ShieldCheck size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900">No Transaction Data</h2>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">We couldn't find any recent transaction context to display here.</p>
                </div>
                <button 
                    onClick={() => navigate('/app')}
                    className="bg-slate-950 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-slate-200"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const isSuccess = status === 'success';
    const isProcessing = status === 'processing' || status === 'pending';
    const isFailed = status === 'error' || status === 'failed';
    const isTimeout = status === 'timeout';

    const StatusIcon = isSuccess ? CheckCircle2 : (isProcessing || isTimeout) ? Clock : XCircle;
    
    let statusColor = 'text-emerald-500';
    let statusBg = 'bg-emerald-50';
    let statusTitle = 'Payment Successful';

    if (isProcessing) {
        statusColor = 'text-orange-500';
        statusBg = 'bg-orange-50';
        statusTitle = 'Transaction Pending';
    } else if (isFailed) {
        statusColor = 'text-red-500';
        statusBg = 'bg-red-50';
        statusTitle = 'Transaction Failed';
    } else if (isTimeout) {
        statusColor = 'text-amber-600';
        statusBg = 'bg-amber-50';
        statusTitle = 'Taking Longer Than Expected';
    }

    return (
        <div className="max-w-xl mx-auto p-4 sm:p-8 space-y-8 animate-in slide-in-from-bottom-8 duration-700 min-h-[90vh] flex flex-col">
            {/* Header / Icon */}
            <div className="text-center space-y-6 pt-4">
                <div className={`w-24 h-24 mx-auto ${statusBg} ${statusColor} rounded-[2rem] flex items-center justify-center shadow-sm transition-all duration-500`}>
                    <StatusIcon size={48} strokeWidth={2.5} className={isProcessing ? 'animate-pulse' : ''} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {statusTitle}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                        {message || (
                            isSuccess 
                                ? 'Your purchase has been authorized and completed successfully.' 
                                : isTimeout 
                                    ? 'Your request is being processed by the network node. Check your history in a few minutes.'
                                    : 'The transaction could not be completed at this time.'
                        )}
                    </p>
                </div>
            </div>

            {/* Summary Card - Scrollable if content is long */}
            <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 flex flex-col flex-1">
                <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction Ledger</span>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusColor.replace('text', 'bg')} shadow-sm`}></div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>{status}</span>
                    </div>
                </div>
                
                <div className="p-8 space-y-8 overflow-y-auto max-h-[400px]">
                    <div className="grid grid-cols-2 gap-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol</p>
                            <p className="font-bold text-slate-900">{transaction.service}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settlement</p>
                            <p className="font-bold text-slate-900">{currency}{transaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipient</p>
                            <p className="font-bold text-slate-900">{transaction.target}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</p>
                            <p className="font-bold text-slate-900">{transaction.timestamp || new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>

                    {transaction.token && (
                        <div className="pt-8 border-t border-slate-50 space-y-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated Token / PIN</p>
                            <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 rounded-bl-[2rem] flex items-center justify-center text-emerald-500 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <ShieldCheck size={32} />
                                </div>
                                <span className="text-3xl font-black text-emerald-700 tracking-[0.2em] font-mono break-all text-center">
                                    {transaction.token.replace(/[^\d]/g, '')}
                                </span>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(transaction.token.replace(/[^\d]/g, ''));
                                        toast.success("Token copied to clipboard!");
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md transition-all border border-emerald-100"
                                >
                                    <Share2 size={12} />
                                    Copy Token
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium text-center italic">
                                Input this code directly into your meter to recharge.
                            </p>
                        </div>
                    )}

                    <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference Node</p>
                            <p className="font-mono text-xs font-bold text-slate-900 tracking-widest uppercase">
                                {transaction.reference || 'ZNT-SVR-GEN-VALIDATING'}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                             <ShieldCheck size={24} />
                        </div>
                    </div>

                    {!transaction.token && isSuccess && (
                         <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex gap-3 items-start">
                              <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                              <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">
                                 Note: This service (Cable/Postpaid) is fulfilled automatically. Your subscription/account status will update within a few minutes.
                              </p>
                         </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pb-8">
                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/app')}
                        className="flex-1 bg-slate-950 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-300"
                    >
                        Go to Dashboard
                    </button>
                    <button 
                        onClick={() => navigate('/app/transactions')}
                        className="flex-1 border border-slate-200 bg-white text-slate-900 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-50 transition-all"
                    >
                        View History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionStatusPage;
