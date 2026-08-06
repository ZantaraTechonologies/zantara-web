import React, { useState, useEffect } from 'react';
import { 
    Banknote, 
    Search, 
    Filter, 
    ExternalLink,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    User,
    ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../services/admin/adminService';
import { ListSkeleton } from '../../components/feedback/Skeletons';
import { useWalletStore } from '../../store/wallet/walletStore';
import { toast } from 'react-hot-toast';

const AdminWithdrawalsPage: React.FC = () => {
    const navigate = useNavigate();
    const { currency } = useWalletStore();
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        loadWithdrawals();
    }, [filter]);

    const loadWithdrawals = async () => {
        setLoading(true);
        try {
            const response = await adminService.fetchWithdrawals({ status: filter });
            setWithdrawals(response.data || []);
        } catch (err) {
            toast.error("Failed to load withdrawals");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Withdrawal Ledger</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Approve or reject fund settlements</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-100">
                    {['pending', 'completed', 'rejected'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                filter === s 
                                ? 'bg-emerald-500 text-slate-950 shadow-lg' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-surface border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Recipient Entity</th>
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Bank Detail</th>
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Settlement</th>
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Timestamp</th>
                                <th className="text-right px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Operation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="p-0"><ListSkeleton count={1} /></td></tr>
                                ))
                            ) : withdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Empty Ledger</td>
                                </tr>
                            ) : withdrawals.map((item) => (
                                <tr key={item._id || item.id} className="group hover:bg-slate-50/60 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-100 shrink-0">
                                                <User size={18} className="text-slate-400" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-slate-900 tracking-tight">{item.userId?.name || 'Unknown User'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.userId?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-slate-700 uppercase tracking-tighter">{item.bankName}</p>
                                            <p className="text-[10px] font-mono text-slate-500">{item.accountNumber}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-slate-900 text-sm">{currency}{item.amount.toLocaleString()}</p>
                                        <p className="text-[10px] text-emerald-500/80 font-bold tracking-widest uppercase">Fee: {currency}{item.fee || 0}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{item.createdAt}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button 
                                            onClick={() => navigate(`/admin/withdrawals/${item._id || item.id}`)}
                                            className="px-4 py-2 rounded-xl bg-surface text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:bg-emerald-500 border border-slate-200 transition-all"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-surface border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl shrink-0">
                    <Banknote className="text-emerald-500" size={20} />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm tracking-tight">Security Protocol Active</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        All pending withdrawals exceeding {currency}50,000 flagged for manual audit by the L3 Security clearance module.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminWithdrawalsPage;
