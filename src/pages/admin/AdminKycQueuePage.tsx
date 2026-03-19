import React, { useState, useEffect } from 'react';
import { 
    Shield, 
    Search, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    ArrowUpRight,
    Eye,
    Filter,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../services/admin/adminService';
import { ListSkeleton } from '../../components/feedback/Skeletons';
import { toast } from 'react-toastify';

const AdminKycQueuePage: React.FC = () => {
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
            const data = await adminService.fetchKycQueue({ status: filter });
            setQueue(data.items || data || []);
        } catch (err) {
            toast.error("Failed to load KYC queue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Identity Verification</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Process pending KYC submissions</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    {['pending', 'approved', 'rejected'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                filter === s 
                                ? 'bg-emerald-500 text-slate-950 shadow-lg' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 h-48 animate-pulse"></div>
                    ))
                ) : queue.length === 0 ? (
                    <div className="col-span-full py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-4">
                        <Shield size={40} className="text-slate-700" />
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Queue is currently empty</p>
                    </div>
                ) : (
                    queue.map((item) => (
                        <div key={item.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-emerald-500/30 transition-all group flex flex-col justify-between space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <Shield size={18} className="text-emerald-500" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-white tracking-tight truncate max-w-[120px]">{item.userName}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.docType}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.submittedAt}</span>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Risk Level</p>
                                    <p className={`text-xs font-bold ${item.riskLevel === 'high' ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {item.riskLevel?.toUpperCase() || 'LOW'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-slate-950 overflow-hidden border border-white/10">
                                    {item.docPreview ? (
                                        <img src={item.docPreview} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Eye size={14} className="text-slate-700" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate(`/admin/kyc/${item.id}`)}
                                className="w-full py-3.5 bg-white/5 text-slate-400 group-hover:bg-emerald-500 group-hover:text-slate-950 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                Begin Review
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminKycQueuePage;
