import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Download, 
    Share2, 
    Copy, 
    CheckCircle2, 
    XCircle, 
    Clock,
    FileText,
    ExternalLink,
    ShieldCheck,
    CreditCard,
    Calendar,
    Hash,
    Info,
    RefreshCw
} from 'lucide-react';
import { useTransactionDetails } from '../../hooks/useWallet';
import { useWalletStore } from '../../store/wallet/walletStore';
import { toast } from 'react-toastify';

const TransactionDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: tx, isLoading, error, refetch } = useTransactionDetails(id);
    const { currency } = useWalletStore();

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 animate-in fade-in duration-500">
                <RefreshCw size={32} className="text-emerald-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Transaction Metadata...</p>
            </div>
        );
    }

    if (error || !tx) {
        return (
            <div className="max-w-md mx-auto text-center py-20 space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-red-100/50">
                    <XCircle size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Transaction Not Found</h2>
                    <p className="text-slate-500 font-medium text-sm px-6">We couldn't retrieve the details for this transaction. It might still be processing or the ID is invalid.</p>
                </div>
                <button 
                    onClick={() => navigate('/app/transactions')}
                    className="flex items-center gap-2 bg-slate-950 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest mx-auto hover:bg-emerald-500 transition-all shadow-xl shadow-slate-200"
                >
                    <ArrowLeft size={16} />
                    <span>Back to History</span>
                </button>
            </div>
        );
    }

    const detailRows = [
        { label: 'Reference ID', value: tx.refId || tx.id, icon: Hash, copyable: true },
        { label: 'Service Type', value: tx.service || tx.type.replace('_', ' ').toUpperCase(), icon: FileText },
        { label: 'Transaction Date', value: new Date(tx.createdAt).toLocaleString(), icon: Calendar },
        { label: 'Payment Method', value: tx.type === 'wallet_fund' ? 'Direct Deposit / Paystack' : 'Zantara Wallet', icon: CreditCard },
        { label: 'Currency', value: tx.currency || 'NGN', icon: Info },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/app/transactions')}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaction Logic</h1>
                    <p className="text-sm text-slate-500 font-medium">Verify the integrity of this financial entry</p>
                </div>
            </div>

            {/* Status Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 relative overflow-hidden text-center space-y-6">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-20"></div>
                
                <div className="space-y-2">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 ${
                        tx.status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                        tx.status === 'pending' ? 'bg-orange-50 border-orange-100 text-orange-500' :
                        'bg-red-50 border-red-100 text-red-500'
                    }`}>
                        {tx.status === 'success' ? <ShieldCheck size={32} /> :
                         tx.status === 'pending' ? <Clock size={32} className="animate-pulse" /> :
                         <XCircle size={32} />}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{tx.status === 'success' ? 'Confirmed Entry' : 'Processing Entry'}</p>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tighter">
                        {currency}{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                </div>

                <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
                    <button 
                        onClick={() => navigate(`/app/transactions/${tx.id}/receipt`)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-400 hover:text-slate-950 transition-all shadow-lg"
                    >
                        <Download size={14} />
                        <span>Get Receipt</span>
                    </button>
                    <button 
                        onClick={() => handleCopy(tx.refId || tx.id, 'Reference')}
                        className="flex items-center gap-2 bg-white border border-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        <Copy size={14} />
                        <span>Copy Ref</span>
                    </button>
                    <button className="flex items-center gap-2 bg-white border border-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                        <Share2 size={14} />
                        <span>Share</span>
                    </button>
                </div>
            </div>

            {/* Metadata Table */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 flex items-center gap-2">
                    <Info size={18} className="text-emerald-500" />
                    <h3 className="font-bold text-slate-900">Information Cluster</h3>
                </div>
                <div className="divide-y divide-slate-50">
                    {detailRows.map((row, i) => (
                        <div key={i} className="p-5 flex items-center justify-between group transition-colors hover:bg-slate-50/50">
                            <div className="flex items-center gap-3 text-slate-400">
                                <row.icon size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest leading-none">{row.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-800 tracking-tight">{row.value}</span>
                                {row.copyable && (
                                    <button 
                                        onClick={() => handleCopy(row.value, row.label)}
                                        className="text-slate-300 hover:text-emerald-500 transition-colors"
                                    >
                                        <Copy size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Earnings Transparency Section */}
            {(tx.type === 'referral_bonus' || tx.type === 'agent_profit' || tx.type === 'referral_skipped' || tx.type === 'referral_redeem' || tx.status === 'skipped') && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            <h3 className="font-bold text-slate-900">Earnings Transparency</h3>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Reward Metadata</span>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        {/* Status Specific Message */}
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <Info size={16} className="text-emerald-500" />
                            <p className="text-xs font-bold text-slate-800">
                                {tx.type === 'referral_bonus' ? 'You earned a referral bonus from this purchase.' :
                                 tx.type === 'agent_profit' ? 'Agent profit generated from this sale.' :
                                 tx.type === 'referral_redeem' ? 'Earnings redeemed to your main wallet.' :
                                 'This commission was skipped due to low service margin.'}
                            </p>
                        </div>

                        {/* Detail Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {tx.buyerRole && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buyer Role</p>
                                    <p className="font-bold text-slate-900 text-sm italic">{tx.buyerRole}</p>
                                </div>
                            )}
                            {tx.originalCommission > 0 && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Commission</p>
                                    <p className="font-bold text-slate-900 text-sm">{currency}{tx.originalCommission.toLocaleString()}</p>
                                </div>
                            )}
                            {tx.wasCapped && (
                                <div className="col-span-2 flex items-center gap-2 text-amber-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                                    <ShieldCheck size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">Capped to protect platform margin</span>
                                </div>
                            )}
                            {tx.type === 'agent_profit' && tx.metadata?.costPrice && (
                                <>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selling Price</p>
                                        <p className="font-bold text-slate-900 text-sm">{currency}{tx.metadata.sellingPrice?.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Cost</p>
                                        <p className="font-bold text-slate-900 text-sm">{currency}{tx.metadata.costPrice?.toLocaleString()}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Help/Support Section */}
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl border border-blue-100 text-blue-500">
                    <Info size={20} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Need help with this?</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">If you have any issues with this transaction, please contact our support team with the Reference ID above. Most issues are resolved within 24 hours.</p>
                    <button 
                        onClick={() => navigate(`/app/support/create?txId=${tx.id || tx._id}`)}
                        className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-2 hover:underline"
                    >
                        Open Support Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailsPage;
