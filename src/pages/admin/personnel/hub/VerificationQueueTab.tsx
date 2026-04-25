import React, { useState, useEffect } from 'react';
import { 
    Shield, 
    Clock, 
    Eye,
    ArrowRight
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 h-64 animate-pulse"></div>
                    ))
                ) : queue.length === 0 ? (
                    <div className="col-span-full py-32 bg-slate-900/20 border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-slate-800">
                            <Shield size={40} />
                        </div>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Queue is currently empty</p>
                    </div>
                ) : (
                    queue.map((item) => (
                        <div key={item.id} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all group flex flex-col justify-between space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                        <Shield size={22} className="text-indigo-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-white tracking-tight italic truncate max-w-[140px]">{item.userName}</p>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.docType}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter italic">{item.submittedAt}</span>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-5 rounded-3xl flex items-center justify-between border border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Protocol Check</p>
                                    <p className={`text-[10px] font-black italic tracking-tight ${item.riskLevel === 'high' ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {item.riskLevel?.toUpperCase() || 'NORMAL'} RISK
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-white/5 overflow-hidden border border-white/10 shadow-2xl">
                                    {item.docPreview ? (
                                        <img src={item.docPreview} alt="Preview" className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Eye size={18} className="text-slate-800" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate(`/admin/kyc/${item.id}`)}
                                className="w-full py-4 bg-white/5 text-slate-500 group-hover:bg-white group-hover:text-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-3"
                            >
                                Start Validation
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VerificationQueueTab;
