import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Banknote, 
    User, 
    ShieldAlert,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import * as adminService from '../../services/admin/adminService';
import { useWalletStore } from '../../store/wallet/walletStore';

const AdminWithdrawalDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currency } = useWalletStore();
    
    const [withdrawal, setWithdrawal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        if (id) {
            loadWithdrawalDetails();
        }
    }, [id]);

    const loadWithdrawalDetails = async () => {
        setLoading(true);
        try {
            const response = await adminService.fetchWithdrawalDetails(id!);
            setWithdrawal(response.data);
        } catch (err) {
            toast.error("Failed to load withdrawal details");
            navigate('/admin/withdrawals');
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (action: 'approve' | 'reject') => {
        if (action === 'reject' && !adminNote.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        setProcessingAction(action);
        try {
            await adminService.processWithdrawal(id!, action, adminNote);
            toast.success(`Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
            loadWithdrawalDetails();
        } catch (err: any) {
            toast.error(err.response?.data?.error || `Failed to ${action} withdrawal`);
        } finally {
            setProcessingAction(null);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading details...</div>;
    }

    if (!withdrawal) {
        return <div className="p-8 text-center text-red-400">Withdrawal not found.</div>;
    }

    const isPending = withdrawal.status === 'pending';

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <button 
                onClick={() => navigate('/admin/withdrawals')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={16} />
                <span className="text-sm font-bold tracking-tight">Back to Ledger</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Withdrawal Review</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">ID: {withdrawal.reference}</p>
                </div>
                
                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${
                    withdrawal.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    withdrawal.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-amber-500/10 border-amber-500/20 text-amber-500'
                }`}>
                    {withdrawal.status === 'completed' && <CheckCircle2 size={16} />}
                    {withdrawal.status === 'rejected' && <XCircle size={16} />}
                    {withdrawal.status === 'pending' && <Clock size={16} />}
                    <span className="text-xs font-bold uppercase tracking-widest">{withdrawal.status}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <User className="text-slate-400" size={20} />
                        <h3 className="text-sm font-bold text-white tracking-tight uppercase">User Information</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</p>
                            <p className="text-sm font-medium text-white">{withdrawal.userId?.name || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</p>
                            <p className="text-sm font-medium text-slate-300">{withdrawal.userId?.email || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone</p>
                            <p className="text-sm font-medium text-slate-300">{withdrawal.userId?.phone || 'Unknown'}</p>
                        </div>
                    </div>
                </div>

                {/* Bank Info */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Banknote className="text-slate-400" size={20} />
                        <h3 className="text-sm font-bold text-white tracking-tight uppercase">Settlement Details</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank Name</p>
                            <p className="text-sm font-medium text-white">{withdrawal.bankName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Number</p>
                            <p className="text-lg font-mono text-emerald-400">{withdrawal.accountNumber}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Name</p>
                            <p className="text-sm font-medium text-white">{withdrawal.accountName}</p>
                        </div>
                    </div>
                </div>

                {/* Amount Info */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:col-span-2">
                    <h3 className="text-sm font-bold text-white tracking-tight uppercase mb-6">Financial Summary</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Requested Amount</p>
                            <p className="text-xl font-bold text-white">{currency}{withdrawal.amount?.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Service Fee</p>
                            <p className="text-xl font-bold text-slate-300">{currency}{withdrawal.fee?.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-emerald-500/20">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Debit</p>
                            <p className="text-2xl font-bold text-emerald-400">{currency}{withdrawal.totalDebit?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Actions */}
            {isPending && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <ShieldAlert className="text-amber-500 shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="text-sm font-bold text-white tracking-tight">Manual Authorization Required</h3>
                            <p className="text-xs text-slate-400 mt-1">Please ensure you have manually transferred the funds to the user's bank account before clicking approve. This action is irreversible.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Admin Note / Rejection Reason</label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Enter reference number or reason for rejection..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleProcess('approve')}
                                disabled={processingAction !== null}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processingAction === 'approve' && <Loader2 className="w-5 h-5 animate-spin" />}
                                {processingAction === 'approve' ? 'Processing...' : 'Approve Payout'}
                            </button>
                            <button
                                onClick={() => handleProcess('reject')}
                                disabled={processingAction !== null}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processingAction === 'reject' && <Loader2 className="w-5 h-5 animate-spin" />}
                                {processingAction === 'reject' ? 'Processing...' : 'Reject Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {!isPending && withdrawal.adminNote && (
                 <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Admin Note</p>
                     <p className="text-sm text-slate-300">{withdrawal.adminNote}</p>
                 </div>
            )}
        </div>
    );
};

export default AdminWithdrawalDetailPage;
