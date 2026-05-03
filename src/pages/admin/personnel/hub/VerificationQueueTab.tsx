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
                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Identity Verification</h3>
                    <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Process pending identity verification requests</p>
                </div>

                <div className="flex bg-slate-900 border border-white/5 p-1 rounded-2xl">
                    {['pending', 'approved', 'rejected'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === s 
                                ? 'bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20' 
                                : 'text-slate-600 hover:text-slate-400'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">User</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Document</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Risk Status</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Submitted At</th>
                                <th className="text-right py-6 px-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Action</th>
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
                            ) : queue.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <Shield size={40} className="text-slate-800 mx-auto mb-4" />
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">No Verification Requests in Queue</p>
                                    </td>
                                </tr>
                            ) : (
                                queue.map((item) => (
                                    <tr key={item._id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                                                    <UserIcon size={20} className="text-slate-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-white tracking-tight italic">
                                                        {item.userId?.name || 'Unknown User'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                                                        {item.userId?.email || 'No Email'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{item.documentType}</p>
                                                    <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 text-[8px] font-black uppercase">Tier {item.tier}</span>
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-600 tracking-tighter italic">Preview Available</p>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Protocol Check</p>
                                                <p className={`text-[10px] font-black italic tracking-tight ${item.riskLevel === 'high' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {item.riskLevel?.toUpperCase() || 'NORMAL'} RISK
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-tighter italic">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <button 
                                                onClick={() => navigate(`/admin/kyc/${item._id}`)}
                                                className="px-6 py-2.5 rounded-2xl bg-white/5 text-slate-500 group-hover:text-slate-950 group-hover:bg-white transition-all border border-white/5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ml-auto"
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
