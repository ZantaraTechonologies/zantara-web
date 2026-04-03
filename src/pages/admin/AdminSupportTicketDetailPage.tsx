import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Send, 
    CheckCircle2, 
    Clock, 
    User, 
    Mail, 
    Hash, 
    AlertCircle,
    MessageSquare,
    MoreVertical,
    ExternalLink,
    ShieldCheck,
    RefreshCw
} from 'lucide-react';
import API from '../../services/api/apiClient';
import { toast } from 'react-hot-toast';

export default function AdminSupportTicketDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchTicket = async () => {
        try {
            const { data } = await API.get(`/admin/support/${id}`);
            setTicket(data.data);
        } catch (err: any) {
            toast.error(err.message || "Failed to load ticket");
            navigate('/admin/support');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;

        setSending(true);
        try {
            await API.post(`/support/reply/${id}`, { message: reply });
            setReply("");
            toast.success("Reply sent");
            fetchTicket();
        } catch (err) {
            toast.error("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    const handleResolve = async (status: string) => {
        try {
            await API.post(`/support/resolve/${id}`, { status });
            toast.success(`Ticket marked as ${status}`);
            fetchTicket();
        } catch (err) {
            toast.error("Action failed");
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
    );

    const messages = [
        { sender: ticket.userId?._id, message: ticket.message, createdAt: ticket.createdAt, isInitial: true },
        ...(ticket.responses || [])
    ];

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                {/* Chat Header */}
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/admin/support')}
                            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="font-bold text-slate-900 tracking-tight">{ticket.subject}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${ticket.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                <span className="text-[10px] font-bold text-slate-400 capitalize tracking-widest">{ticket.status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {ticket.status !== 'resolved' && (
                            <button 
                                onClick={() => handleResolve('resolved')}
                                className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Mark Resolved
                            </button>
                        )}
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages Panel */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:20px_20px]"
                >
                    {messages.map((m, i) => {
                        const isMe = m.sender !== ticket.userId?._id;
                        return (
                            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-6 py-4 rounded-3xl text-sm font-medium leading-relaxed ${
                                        isMe 
                                        ? 'bg-slate-950 text-white rounded-tr-none' 
                                        : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-none'
                                    }`}>
                                        {m.message}
                                    </div>
                                    <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-tighter px-2`}>
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && <span className="ml-2 text-emerald-500">Authorized Agent</span>}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                {ticket.status !== 'resolved' ? (
                    <form onSubmit={handleSendReply} className="p-6 bg-slate-50/50 border-t border-slate-50">
                        <div className="relative group">
                            <input 
                                type="text" 
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Type your response as an administrator..."
                                className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-6 pr-16 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300"
                            />
                            <button 
                                type="submit"
                                disabled={sending || !reply.trim()}
                                className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-500 text-slate-950 rounded-xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-30 disabled:bg-slate-300"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-8 bg-emerald-50 border-t border-emerald-100 flex items-center justify-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={20} />
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.2em]">Transaction has been marked as resolved. Conversation closed.</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar Info */}
            <div className="w-full lg:w-80 space-y-6">
                <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                     <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500 mb-6">Auditor View</h3>
                     
                     <div className="space-y-6">
                         <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                                 <User size={20} className="text-emerald-500" />
                             </div>
                             <div>
                                 <p className="text-xs font-bold truncate max-w-[150px]">{ticket.userId?.name || "Anonymous"}</p>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stakeholder</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                                 <Mail size={20} className="text-emerald-500" />
                             </div>
                             <div>
                                 <p className="text-xs font-bold truncate max-w-[150px]">{ticket.userId?.email}</p>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Network Node</p>
                             </div>
                         </div>
                     </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                    <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Metadata</p>
                         <div className="space-y-3">
                             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                 <div className="flex items-center gap-2 text-slate-400">
                                     <Hash size={14} />
                                     <span className="text-[10px] font-bold uppercase">Priority</span>
                                 </div>
                                 <span className={`text-[10px] font-bold uppercase ${ticket.priority === 'high' ? 'text-rose-500' : 'text-slate-900'}`}>{ticket.priority || 'Normal'}</span>
                             </div>
                             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                 <div className="flex items-center gap-2 text-slate-400">
                                     <Clock size={14} />
                                     <span className="text-[10px] font-bold uppercase">Opened</span>
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-900">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                             </div>
                         </div>
                    </div>

                    {ticket.transactionId && (
                        <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Related Entry</p>
                             <button 
                                onClick={() => navigate(`/admin/transactions?search=${ticket.transactionId}`)}
                                className="w-full flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all group"
                             >
                                 <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
                                     <ShieldCheck size={16} />
                                 </div>
                                 <div className="flex-1 text-left">
                                     <span className="block text-[10px] font-mono font-bold text-emerald-900 leading-none mb-1">{ticket.transactionId}</span>
                                     <span className="block text-[9px] text-emerald-600 font-bold uppercase tracking-widest">View Audit Log</span>
                                 </div>
                                 <ExternalLink size={14} className="text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                             </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
