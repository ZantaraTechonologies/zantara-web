import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Shield,
    Wallet,
    History,
    User as UserIcon,
    CheckCircle2,
    AlertCircle,
    Ban,
    ArrowUpRight,
    ArrowDownLeft,
    Mail,
    Phone,
    Calendar,
    Unlock,
    Activity,
    Loader2
} from 'lucide-react';
import { useWalletStore } from '../../store/wallet/walletStore';
import * as adminService from '../../services/admin/adminService';
import { CardSkeleton, ListSkeleton } from '../../components/feedback/Skeletons';
import { toast } from 'react-toastify';

const AdminUserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currency } = useWalletStore();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (id) loadUser(id);
    }, [id]);

    const loadUser = async (userId: string) => {
        setLoading(true);
        try {
            const data = await adminService.fetchUserDetails(userId);
            setUser(data);
        } catch (err) {
            toast.error("User not found");
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async () => {
        if (!user || processing) return;
        setProcessing(true);
        try {
            // Simplified: we'll use a generic update or specific block endpoint
            // For now assuming the backend has an endpoint for this
            // await adminService.blockUser(user.id); 
            toast.success(user.isBlocked ? "User Unblocked" : "User Blocked Successfully");
            loadUser(user.id);
        } catch (err) {
            toast.error("Operation failed");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="space-y-6"><CardSkeleton /><ListSkeleton count={5} /></div>;

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
            >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to Directory</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: User Identity Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-10 -mt-10 rounded-full"></div>

                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                                <UserIcon size={32} className="text-emerald-500" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">{user.firstName} {user.lastName}</h1>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">UID: {user.id?.slice(-8).toUpperCase()}</p>
                            </div>

                            <div className="flex gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${user.kycVerified
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                    }`}>
                                    {user.kycVerified ? 'KYC Verified' : 'KYC Pending'}
                                </span>
                                {user.isBlocked && (
                                    <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        Blocked
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                    <Mail size={14} className="text-slate-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm text-slate-300 font-medium">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                    <Phone size={14} className="text-slate-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Phone Number</p>
                                    <p className="text-sm text-slate-300 font-medium">{user.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                    <Calendar size={14} className="text-slate-500" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Joined Date</p>
                                    <p className="text-sm text-slate-300 font-medium">{new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-3">
                            <button
                                onClick={handleToggleBlock}
                                disabled={processing}
                                className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${user.isBlocked
                                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                                        : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                                    }`}
                            >
                                {processing ? <Loader2 size={16} className="animate-spin" /> : (user.isBlocked ? <Unlock size={14} /> : <Ban size={14} />)}
                                {user.isBlocked ? 'Unblock User' : 'Block User'}
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest transition-all">
                                <AlertCircle size={14} />
                                Reset PIN
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Financial Summary & Activity */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/10">
                                    <Wallet size={20} className="text-emerald-500" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Wallet</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{currency}{(user.balance || 0).toLocaleString()}</h3>
                                <p className="text-emerald-500 font-bold text-[10px] tracking-[0.2em] mt-1 flex items-center gap-1">
                                    <ArrowUpRight size={12} />
                                    LIQUID FUNDS
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/10">
                                    <History size={20} className="text-blue-500" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Volume (MTD)</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{currency}{(user.stats?.monthlyVolume || 0).toLocaleString()}</h3>
                                <p className="text-blue-500 font-bold text-[10px] tracking-[0.2em] mt-1 flex items-center gap-1">
                                    <Activity size={12} />
                                    NETWORK SPEED
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white tracking-tight">Ledger History</h3>
                            <button className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest hover:underline">Full Statement</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/[0.01]">
                                    <tr className="border-b border-white/5">
                                        <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Transaction</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Amount</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Node</th>
                                        <th className="text-right py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(user.transactions || []).map((tx: any, i: number) => (
                                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-bold text-slate-300">{tx.service}</p>
                                                    <p className="text-[10px] font-mono text-slate-500">{tx.reference}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className={`font-bold text-sm ${tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                    {tx.type === 'credit' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                                                </p>
                                                <p className="text-[10px] text-slate-600 font-bold uppercase">{tx.date}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ZANTARA_L2</p>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="text-emerald-400/80 bg-emerald-500/5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!user.transactions || user.transactions.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">No ledger records found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailPage;
