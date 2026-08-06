import React, { useState, useEffect } from 'react';
import { 
    Search, 
    User as UserIcon, 
    Shield, 
    ChevronLeft,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../../../services/admin/adminService';
import { ListSkeleton } from '../../../../components/feedback/Skeletons';
import { useWalletStore } from '../../../../store/wallet/walletStore';
import { toast } from 'react-toastify';

const UserDirectoryTab: React.FC = () => {
    const navigate = useNavigate();
    const { currency } = useWalletStore();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadUsers();
    }, [page]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await adminService.fetchUsers({ page, search });
            const result = response.data;
            setUsers(result.users || []);
            setTotalPages(result.pagination?.totalPages || 1);
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">User Registry</h3>
                    <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Manage accounts, status & access levels</p>
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
                            className="bg-surface border border-slate-200 rounded-2xl pl-12 pr-6 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all w-full sm:w-80 font-bold"
                        />
                    </div>
                </form>
            </div>

            <div className="bg-surface border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Profile</th>
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Security</th>
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Balance</th>
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                                <th className="text-right px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
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
                                    <td colSpan={5} className="py-24 text-center">
                                        <UserIcon size={40} className="text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">No Users Found in Registry</p>
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user._id} className="group hover:bg-slate-50/60 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
                                                <UserIcon size={20} className="text-slate-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-slate-900 tracking-tight">{user.firstName} {user.lastName}</p>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                                        user.role === 'superAdmin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                        user.role === 'admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                        user.role === 'agent' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'hidden'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <Shield size={12} className={user.kycVerified ? 'text-emerald-500' : 'text-slate-400'} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${user.kycVerified ? 'text-emerald-500/80' : 'text-slate-400'}`}>
                                                    {user.kycVerified ? 'Verified' : 'Unverified'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-mono text-slate-600 tracking-tighter">{user.phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-[10px] text-emerald-500 font-black">{currency}</span>
                                            <p className="font-black text-slate-900 text-lg tracking-tighter">{(user.balance || 0).toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            user.isBlocked 
                                            ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => navigate(`/admin/users/${user._id}`)}
                                            className="p-3 rounded-2xl bg-surface text-slate-500 hover:text-white hover:bg-emerald-500 transition-all border border-slate-200 shadow-xl shadow-emerald-500/0 hover:shadow-emerald-500/20"
                                        >
                                            <ArrowUpRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Inventory Node {page} of {totalPages}</p>
                    <div className="flex gap-4">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-3 rounded-xl bg-surface text-slate-500 disabled:opacity-20 hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-3 rounded-xl bg-surface text-slate-500 disabled:opacity-20 hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDirectoryTab;
