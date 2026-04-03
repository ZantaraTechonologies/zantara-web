import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    Search, 
    Filter, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    ArrowUpRight,
    User,
    ChevronRight,
    Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as supportService from '../../services/support/supportService'; 
import * as adminService from '../../services/admin/adminService';
import { ListSkeleton } from '../../components/feedback/Skeletons';
import { toast } from 'react-hot-toast';

const AdminSupportTicketsPage: React.FC = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('open');

    useEffect(() => {
        loadTickets();
    }, [filter]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const response = await adminService.fetchAllTickets({ status: filter });
            setTickets(response.data || []);
        } catch (err) {
            toast.error("Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Support Center</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Manage user inquiries & resolutions</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    {['open', 'pending', 'resolved', 'closed'].map((s) => (
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

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <ListSkeleton items={5} />
                ) : tickets.length === 0 ? (
                    <div className="py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-4">
                        <MessageSquare size={40} className="text-slate-700" />
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">No tickets found in this category</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div 
                            key={ticket.id} 
                            onClick={() => navigate(`/admin/support/${ticket.id}`)}
                            className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                        >
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${
                                    ticket.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                    <MessageSquare size={20} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-sm font-bold text-white tracking-tight">{ticket.subject}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                            ticket.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-white/10 text-slate-400'
                                        }`}>
                                            {ticket.priority || 'Normal'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium line-clamp-1">{ticket.lastMessage || 'Waiting for response...'}</p>
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest pt-1">
                                        <div className="flex items-center gap-1.5">
                                            <User size={12} />
                                            <span>{ticket.userName || ticket.userEmail}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Tag size={12} />
                                            <span>#{ticket.category || 'General'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="text-right space-y-1">
                                    <div className="flex items-center gap-2 text-slate-500 justify-end">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{ticket.updatedAt}</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-500/80 font-bold tracking-widest uppercase">ID: {ticket.id?.slice(-6).toUpperCase()}</p>
                                </div>
                                <ChevronRight className="text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" size={20} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminSupportTicketsPage;
