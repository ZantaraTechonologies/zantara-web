import React, { useState, useEffect } from 'react';
import { 
    Shield, 
    Clock, 
    Eye,
    ArrowRight,
    User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../../../services/admin/adminService';
import { ListSkeleton } from '../../../../components/feedback/Skeletons';
import { toast } from 'react-toastify';

const VerificationQueueTab: React.FC = () => {
    const navigate = useNavigate();
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        loadQueue();
    }, [filter]);

    const loadQueue = async () => {
        setLoading(true);
        try {
            const response = await adminService.fetchKycQueue({ status: filter });
            setQueue(response.data || []);
        } catch (err) {
            toast.error("Failed to load KYC queue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Identity Verification</h3>
                    <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Process pending identity verification requests</p>
                </div>

                <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-2xl">
                    {['pending', 'approved', 'rejected'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === s 
                                ? 'bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20' 
                                : 'text-slate-500 hover:text-slate-900'
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
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">User</th>
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Document</th>
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Risk Status</th>
                                <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Submitted At</th>
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
                            ) : queue.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <Shield size={40} className="text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">No Verification Requests in Queue</p>
                                    </td>
                                </tr>
                            ) : (
                                queue.map((item) => (
                                    <tr key={item._id} className="group hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
                                                    <UserIcon size={20} className="text-slate-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-slate-900 tracking-tight">
                                                        {item.userId?.name || 'Unknown User'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                                                        {item.userId?.email || 'No Email'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.documentType}</p>
                                                    <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 border border-indigo-500/10 text-[8px] font-black uppercase">Tier {item.tier}</span>
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-600 tracking-tighter">Preview Available</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Protocol Check</p>
                                                <p className={`text-[10px] font-black tracking-tight ${item.riskLevel === 'high' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {item.riskLevel?.toUpperCase() || 'NORMAL'} RISK
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => navigate(`/admin/kyc/${item._id}`)}
                                                className="px-6 py-2.5 rounded-2xl bg-surface text-slate-500 group-hover:text-slate-900 group-hover:bg-slate-100 transition-all border border-slate-200 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ml-auto"
                                            >
                                                Validate
                                                <ArrowRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VerificationQueueTab;
