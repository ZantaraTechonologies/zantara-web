import React, { useState, useEffect } from 'react';
import { 
    Shield, 
    Search, 
    Filter, 
    Download, 
    ChevronLeft, 
    ChevronRight,
    Activity,
    Clock,
    User,
    Lock,
    Terminal
} from 'lucide-react';
import * as adminService from '../../services/admin/adminService';
import { ListSkeleton } from '../../components/feedback/Skeletons';
import { toast } from 'react-toastify';

const AdminAuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadLogs();
    }, [page]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const response = await adminService.fetchAuditLogs({ page, search });
            setLogs(response.data || []);
        } catch (err) {
            toast.error("Failed to load audit logs");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Audit logs</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Track every administrative action</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <Search size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Operator identity..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all w-full sm:w-64"
                        />
                    </div>
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Operator</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Action</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Scope/Target</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="p-0"><ListSkeleton count={1} /></td></tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">No audit entries detected</td>
                                </tr>
                            ) : logs.map((log, i) => (
                                <tr key={i} className="group hover:bg-white/5 transition-colors text-[13px]">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock size={12} />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200 leading-none mb-1">{log.operatorName || log.operatorId}</p>
                                                <p className="text-[9px] font-medium text-slate-500 font-mono tracking-tighter truncate max-w-[120px]">{log.ipAddress || 'UNKNOWN_IP'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                                log.action.includes('DELETE') ? 'bg-red-500/5 text-red-500 border-red-500/10' :
                                                log.action.includes('CREATE') ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' :
                                                'bg-blue-500/5 text-blue-500 border-blue-500/10'
                                            }`}>{log.action}</span>
                                            <p className="text-[9px] text-slate-500 truncate max-w-[200px] font-medium leading-none opacity-60">{log.userAgent || 'System Process'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">{log.target || 'GLOBAL_SCOPE'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                            Success
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAuditLogsPage;
