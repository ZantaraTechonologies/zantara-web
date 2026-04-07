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
    Loader2,
    Smartphone,
    Globe,
    Zap,
    Tv,
    CreditCard,
    PlusCircle,
    MinusCircle,
    Download
} from 'lucide-react';
import { useWalletStore } from '../../store/wallet/walletStore';
import * as adminService from '../../services/admin/adminService';
import { updateUserCommissionRate, updateUserAgentDiscount } from '../../services/admin/adminBusinessService';
import { CardSkeleton, ListSkeleton } from '../../components/feedback/Skeletons';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { hasAnyRole } from '../../utils/access';

const AdminUserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currency } = useWalletStore();
    const { admin } = useAdminAuth();
    const isSuperAdmin = hasAnyRole(admin, ['superAdmin']);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    
    // Pricing Overrides State
    const [customCommRate, setCustomCommRate] = useState<number | ''>('');
    const [customAgentDiscount, setCustomAgentDiscount] = useState<number | ''>('');

    const getTransactionConfig = (type: string) => {
        switch (type) {
            case 'funding':
            case 'credit':
            case 'settlement':
                return { icon: <PlusCircle size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Wallet Funding' };
            case 'data':
                return { icon: <Globe size={16} />, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Data Purchase' };
            case 'airtime':
                return { icon: <Smartphone size={16} />, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Airtime Purchase' };
            case 'tv':
            case 'cable':
                return { icon: <Tv size={16} />, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'TV Subscription' };
            case 'electricity':
                return { icon: <Zap size={16} />, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Utility Bill' };
            case 'withdrawal':
            case 'expense':
                return { icon: <MinusCircle size={16} />, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Funds Withdrawal' };
            case 'referral_redeem':
            case 'referral_bonus':
                return { icon: <ArrowUpRight size={16} />, color: 'text-indigo-500', bg: 'bg-indigo-500/10', label: 'Referral Bonus' };
            default:
                return { icon: <Activity size={16} />, color: 'text-slate-400', bg: 'bg-white/5', label: type.toUpperCase() };
        }
    };

    useEffect(() => {
        if (id) loadUser(id);
    }, [id]);

    const loadUser = async (userId: string) => {
        setLoading(true);
        try {
            const response = await adminService.fetchUserDetails(userId);
            const userData = response.data;
            setUser(userData);
            
            // Set initial overrides from user data
            if (userData.commissionRate !== undefined && userData.commissionRate !== null) {
                setCustomCommRate(userData.commissionRate * 100);
            } else {
                setCustomCommRate('');
            }
            
            if (userData.agentDiscountRate !== undefined && userData.agentDiscountRate !== null) {
                setCustomAgentDiscount(userData.agentDiscountRate * 100);
            } else {
                setCustomAgentDiscount('');
            }
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
            await adminService.blockUser(user._id, !user.isBlocked);
            toast.success(user.isBlocked ? "User Unblocked Successfully" : "User Blocked Successfully");
            loadUser(user._id);
        } catch (err) {
            toast.error("Operation failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleRoleUpdate = async (newRole: string) => {
        if (!user || processing) return;
        
        const confirmMsg = `Are you sure you want to change this user's role to ${newRole}?`;
        if (!window.confirm(confirmMsg)) return;

        setProcessing(true);
        try {
            await adminService.updateUserRole(user._id, newRole);
            toast.success(`User role updated to ${newRole} successfully`);
            loadUser(user._id); // Reload user to reflect changes
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to update role";
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    };

    const handleSavePricingOverrides = async () => {
        if (!user || processing) return;
        setProcessing(true);
        try {
            // Update Commission Rate
            const commValue = customCommRate === '' ? null : Number(customCommRate) / 100;
            const agentValue = customAgentDiscount === '' ? null : Number(customAgentDiscount) / 100;

            await Promise.all([
                updateUserCommissionRate(user._id, { commissionRate: commValue }),
                updateUserAgentDiscount(user._id, { agentDiscountRate: agentValue })
            ]);

            toast.success("Pricing protocols updated for user");
            loadUser(user._id);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update pricing");
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

                            <div className="flex flex-wrap justify-center gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                    user.role === 'superAdmin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                    user.role === 'admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                    user.role === 'agent' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    'bg-slate-500/10 text-slate-500 border-white/5'
                                }`}>
                                    {user.role?.toUpperCase() || 'USER'}
                                </span>
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

                        {/* Pricing & Commissions Section — SuperAdmin Only */}
                        {isSuperAdmin && (
                        <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={14} className="text-blue-500" />
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pricing & Commissions</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        <label>Referral Commission (%)</label>
                                        <span className={customCommRate === '' ? 'text-slate-600' : 'text-emerald-500'}>
                                            {customCommRate === '' ? 'Using Default' : 'Custom Override'}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            step="0.01"
                                            value={customCommRate}
                                            onChange={(e) => setCustomCommRate(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-all"
                                            placeholder="System Default"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">%</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        <label>Agent Discount (%)</label>
                                        <span className={customAgentDiscount === '' ? 'text-slate-600' : 'text-blue-500'}>
                                            {customAgentDiscount === '' ? 'Using Default' : 'Custom Override'}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            step="0.1"
                                            value={customAgentDiscount}
                                            onChange={(e) => setCustomAgentDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-all"
                                            placeholder="System Default"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600">%</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSavePricingOverrides}
                                    disabled={processing}
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    {processing ? <Loader2 className="animate-spin" size={16} /> : "Synchronize Overrides"}
                                </button>
                                <p className="text-[8px] text-slate-600 font-medium leading-relaxed italic text-center px-4">
                                    * Leave blank to use system defaults defined in the financial settings dashboard.
                                </p>
                            </div>
                        </div>
                        )}

                        {/* Role Management Section — SuperAdmin Only */}
                        {isSuperAdmin && (
                        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={14} className="text-emerald-500" />
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Authority Management</h3>
                            </div>
                            <div className="space-y-3">
                                <select 
                                    value={user.role || 'user'}
                                    onChange={(e) => handleRoleUpdate(e.target.value)}
                                    disabled={processing}
                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <option value="user">Standard User</option>
                                    <option value="agent">Business Agent</option>
                                    <option value="admin">Platform Admin</option>
                                    <option value="superAdmin">Super Administrator</option>
                                </select>
                                <p className="text-[9px] text-slate-500 font-medium italic px-2">
                                    Promoting a user grants them access to restricted admin zones.
                                </p>
                            </div>
                        </div>
                        )}
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
                                <h3 className="text-3xl font-bold text-rose-500 tracking-tight">{currency}{(user.stats?.monthlyVolume || 0).toLocaleString()}</h3>
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
                            <button 
                                onClick={() => navigate(`/admin/transactions?userId=${user._id}`)}
                                className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest hover:underline"
                            >
                                Full Statement
                            </button>
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
                                    {(user.transactions || []).map((tx: any, i: number) => {
                                        const config = getTransactionConfig(tx.type);
                                        const isCredit = ['funding', 'credit', 'referral_bonus', 'settlement'].includes(tx.type);
                                        
                                        return (
                                            <tr key={i} className="group hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${config.bg} ${config.color} flex items-center justify-center border border-white/5`}>
                                                            {config.icon}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-bold text-slate-300">{config.label} {tx.service ? `- ${tx.service}` : ''}</p>
                                                            <p className="text-[10px] font-mono text-slate-500 font-medium uppercase tracking-tight">{tx.transactionId || tx.refId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className={`font-bold text-sm ${isCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {isCredit ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                        <Activity size={12} className="text-slate-500" />
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">L2_NODE</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                        tx.status === 'success' ? 'text-emerald-400/80 bg-emerald-500/5' :
                                                        tx.status === 'failed' ? 'text-rose-400/80 bg-rose-500/5' :
                                                        'text-amber-400/80 bg-amber-500/5'
                                                    }`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
