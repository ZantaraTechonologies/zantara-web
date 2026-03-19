import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    MoreVertical, 
    User as UserIcon, 
    Shield, 
    Ban, 
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../services/admin/adminService';
import { ListSkeleton } from '../../components/feedback/Skeletons';
import { toast } from 'react-toastify';

const AdminUsersPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadUsers();
    }, [page]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.fetchUsers({ page, search });
            setUsers(data.users || data || []);
        } catch (err) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadUsers();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">User Directory</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Manage accounts & access levels</p>
                </div>

                <form onSubmit={handleSearch} className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search email, phone, name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all w-full sm:w-80"
                        />
                    </div>
                </form>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Profile</th>
                                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Security</th>
                                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Balance</th>
                                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="text-right py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="p-0">
                                            <ListSkeleton count={1} />
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">No Users Found</td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                                <UserIcon size={18} className="text-slate-400" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-white tracking-tight">{user.firstName} {user.lastName}</p>
                                                <p className="text-[11px] text-slate-500 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Shield size={12} className={user.kycVerified ? 'text-emerald-500' : 'text-slate-600'} />
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${user.kycVerified ? 'text-emerald-500/80' : 'text-slate-500'}`}>
                                                    {user.kycVerified ? 'KYC Verified' : 'KYC Pending'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-mono text-slate-600 tracking-tighter">{user.phone}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-white text-sm">₦{(user.balance || 0).toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">General Ledger</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                            user.isBlocked 
                                            ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button 
                                            onClick={() => navigate(`/admin/users/${user.id}`)}
                                            className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-emerald-500 transition-all border border-white/10"
                                        >
                                            <ArrowUpRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Page {page} of N</p>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-lg bg-white/5 text-slate-400 disabled:opacity-30 hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;
