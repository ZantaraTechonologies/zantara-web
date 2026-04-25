import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    ShieldCheck, 
    ArrowRightCircle, 
    Smartphone, 
    Globe, 
    Zap, 
    Tv, 
    Terminal, 
    User, 
    Calendar,
    Hash,
    Layers,
    CheckCircle2,
    XCircle,
    Info,
    Receipt,
    RefreshCw
} from 'lucide-react';
import API from '../../services/api/apiClient';
import { toast } from 'react-hot-toast';

export default function AdminTransactionDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [txn, setTxn] = useState<any>(null);
    const [verifying, setVerifying] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/transaction-logs/admin/transactions/all`, {
                params: { search: id } // Using search to find by ID if specific endpoint isn't ready
            });
            const record = data.data.transactions?.find((t: any) => t._id === id);
            if (!record) throw new Error("Transaction not found");
            setTxn(record);
        } catch (err: any) {
            toast.error(err.message || "Failed to load audit entry");
            navigate('/admin/transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleRecheck = async () => {
        setVerifying(true);
        try {
            const ref = txn.transactionId || txn.refId || txn.reference;
            await API.post("/services/transaction/status", { reference: ref });
            toast.success("State synchronized with provider");
            fetchData();
        } catch (err) {
            toast.error("Recheck rejected by gateway");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
    );

    const isCredit = ['funding', 'credit', 'settlement', 'referral_bonus', 'commission'].includes((txn.type || txn.service || '').toLowerCase());
    const userDisplay = typeof txn.userId === 'object' ? (txn.userId?.email || txn.userId?.name) : (txn.userId || "Unknown");

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/admin/transactions')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                    <ChevronLeft size={16} />
                    Back to Audit Logs
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Ledger ID:</span>
                    <span className="text-[10px] font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{txn._id}</span>
                </div>
            </div>

            {/* Hero Card */}
            <div className="bg-slate-950 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative shadow-2xl shadow-emerald-500/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className={`px-4 py-1.5 rounded-full inline-flex items-center gap-2 font-bold uppercase tracking-widest text-[9px] ${
                            txn.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                            txn.status === 'failed' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                        }`}>
                            <ShieldCheck size={12} />
                            Entitlement {txn.status}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                            {isCredit ? '+' : '-'}{new Intl.NumberFormat(undefined, { style: "currency", currency: "NGN" }).format(txn.amount || 0).replace('NGN', '₦')}
                        </h1>
                        <p className="text-slate-400 font-medium flex items-center gap-2">
                            <Layers size={16} className="text-emerald-500" />
                            Provisioning: <span className="text-white capitalize">{txn.service}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleRecheck}
                            disabled={verifying}
                            className="bg-white/10 hover:bg-white/20 text-white p-6 rounded-3xl transition-all active:scale-95 group disabled:opacity-30"
                        >
                            <RefreshCw size={24} className={verifying ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                        </button>
                        <button 
                            onClick={() => window.print()}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-6 rounded-3xl font-black uppercase tracking-widest text-xs flex flex-col items-center gap-1 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                        >
                            <Receipt size={24} />
                            Print
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Audit Logic & Integrity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 tracking-tight">Transaction Logic</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Financial Integrity verification</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group overflow-hidden">
                                <div className="absolute right-0 top-0 p-4 opacity-5">
                                    <Info size={40} />
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium">
                                    {isCredit 
                                        ? `This entry represents a successful wallet inflow. The ledger system verified the external payment reference and incremented the balance for account ${userDisplay} by ₦${txn.amount}.`
                                        : `This entry represents a service purchase. The system successfully debited ₦${txn.amount} from ${userDisplay}'s ledger and dispatched a request to the ${txn.service} protocol provider.`
                                    }
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                                    <CheckCircle2 size={24} className="text-emerald-500" />
                                    <div>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Signature</p>
                                        <p className="text-xs font-bold text-slate-900">Valid & Verified</p>
                                    </div>
                                </div>
                                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-4">
                                    <ArrowRightCircle size={24} className="text-blue-500" />
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Protocol Status</p>
                                        <p className="text-xs font-bold text-slate-900">{txn.status === 'success' ? 'Finalized' : 'Pending Verification'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Flow */}
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950">
                                <Terminal size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 tracking-tight">Timeline Analysis</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Step-by-step transaction flow</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative ml-4 border-l-2 border-slate-100 pl-8 pb-4">
                            <div className="relative">
                                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-slate-950 border-4 border-white" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(txn.createdAt).toLocaleString()}</p>
                                    <p className="text-sm font-bold text-slate-900">Initiation Context</p>
                                    <p className="text-xs text-slate-500">Request received from User Node: {userDisplay}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-lg shadow-emerald-500/20" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing (Real-time)</p>
                                    <p className="text-sm font-bold text-slate-900">Ledger Update</p>
                                    <p className="text-xs text-slate-500">Wallet balance recalculated and updated across distributed nodes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
                        <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Identifiers</p>
                             <div className="space-y-3">
                                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                     <div className="flex items-center gap-2 text-slate-400">
                                         <Hash size={14} />
                                         <span className="text-[10px] font-bold uppercase tracking-tighter">System Ref</span>
                                     </div>
                                     <span className="text-[10px] font-mono text-slate-900 font-bold">{txn.transactionId || "NONE"}</span>
                                 </div>
                                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                     <div className="flex items-center gap-2 text-slate-400">
                                         <Layers size={14} />
                                         <span className="text-[10px] font-bold uppercase tracking-tighter">Gateway Ref</span>
                                     </div>
                                     <span className="text-[10px] font-mono text-slate-900 font-bold truncate max-w-[120px]">{txn.refId || txn.reference || "NONE"}</span>
                                 </div>
                             </div>
                        </div>

                        <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Stakeholder Info</p>
                             <div className="space-y-3">
                                 <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
                                     <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                         <User size={16} />
                                     </div>
                                     <div className="flex flex-col">
                                         <span className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]">{userDisplay}</span>
                                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Main Account</span>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                                     <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                         <Calendar size={16} />
                                     </div>
                                     <div className="flex flex-col">
                                         <span className="text-[11px] font-bold text-slate-900">{new Date(txn.createdAt).toLocaleDateString()}</span>
                                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Entry Date</span>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Financial Reconciliation Explorer */}
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between ml-1">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Reconciliation</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                txn.accountingSource === 'actual' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                                {txn.accountingSource || 'Estimated'} Source
                            </span>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl text-white">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">User Paid</span>
                                <span className="text-sm font-black italic">₦{(txn.amount || 0).toLocaleString()}</span>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Settlement Cost</span>
                                    <span className="text-xs font-bold text-slate-700">₦{(txn.costPrice || 0).toLocaleString()}</span>
                                </div>
                                {txn.accountingSource === 'actual' && (
                                    <>
                                        <div className="flex items-center justify-between pl-2 border-l-2 border-emerald-500/20">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Provider Unit Price</span>
                                            <span className="text-[10px] font-bold text-slate-500">₦{(txn.providerUnitPrice || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between pl-2 border-l-2 border-emerald-500/20">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Provider Discount</span>
                                            <span className="text-[10px] font-bold text-emerald-500">-₦{(txn.vendorCommission || 0).toLocaleString()}</span>
                                        </div>
                                        {txn.convenienceFee > 0 && (
                                            <div className="flex items-center justify-between pl-2 border-l-2 border-rose-500/20">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Conv. Fee</span>
                                                <span className="text-[10px] font-bold text-rose-400">+₦{txn.convenienceFee.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                {txn.accountingSource !== 'actual' && txn.pricingSnapshot && (
                                    <div className="flex items-center justify-between pl-2 border-l-2 border-slate-200">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Base Cost (Est.)</span>
                                        <span className="text-[10px] font-bold text-slate-500">₦{txn.pricingSnapshot.baseCostPrice}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-4 bg-emerald-500 rounded-2xl text-slate-950 shadow-lg shadow-emerald-500/10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Platform Yield</span>
                                    <span className="text-[8px] font-bold uppercase tracking-tighter opacity-50">Net Realized Profit</span>
                                </div>
                                <span className="text-lg font-black tracking-tighter">₦{(txn.profit || 0).toLocaleString()}</span>
                            </div>

                            {txn.commission > 0 && (
                                <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Referral Payout</span>
                                    <span className="text-[10px] font-bold text-rose-500">-₦{txn.commission}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Explorer */}
                    <div className="bg-slate-950 rounded-[2rem] p-6 shadow-xl shadow-slate-200 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Terminal size={60} className="text-white" />
                        </div>
                        <h4 className="text-white font-bold text-xs mb-4 flex items-center gap-2">
                             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                             Raw JSON Audit
                        </h4>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap leading-tight">
                                {JSON.stringify(txn, null, 2)}
                            </pre>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-4 font-medium uppercase tracking-[0.2em] text-center">Protocol Level View</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
