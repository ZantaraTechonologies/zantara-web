import React, { useState, useRef, useEffect } from 'react';
import { useTicketDetails, useReplyToTicket } from '../../hooks/useSupport';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, User, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const SupportTicketDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: ticket, isLoading, isError, error } = useTicketDetails(id!);
    const { mutate: sendReply, isPending: isReplying } = useReplyToTicket();
    const [reply, setReply] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket]);

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;
        sendReply({ id: id!, message: reply }, {
            onSuccess: () => setReply('')
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (isError || !ticket) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 shadow-sm">
                    <AlertCircle size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900">Ticket Not Found</h2>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                        {isError 
                            ? (error as any)?.response?.data?.message || 'We encountered a problem retrieving this ticket.'
                            : "We couldn't retrieve the details for this ticket. It may have been removed or the ID is incorrect."
                        }
                    </p>
                    {isError && (
                        <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest">
                            Status: {(error as any)?.response?.status || 'Unknown'}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        to="/app/support" 
                        className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        Back
                    </Link>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-slate-950 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-slate-200"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const safeFormatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return format(date, 'MMM dd, hh:mm a');
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex items-center justify-between pb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/app/support" className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors bg-white rounded-xl border border-slate-100 shadow-sm">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight max-w-[300px] truncate">{ticket.subject}</h1>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                ticket.status === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                                {ticket.status}
                            </span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Ticket ID: {ticket._id?.slice(-8).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-hidden bg-white rounded-t-[2.5rem] border-x border-t border-slate-100 shadow-sm flex flex-col">
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth"
                >
                    {/* Initial Message */}
                    <div className="flex flex-col items-start space-y-2 max-w-[85%]">
                        <div className="bg-slate-50 p-6 rounded-3xl rounded-tl-none border border-slate-100 text-slate-700 text-sm leading-relaxed relative">
                            <p>{ticket.message}</p>
                            {ticket.transactionId && (
                                <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center gap-2">
                                     <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Ref: {ticket.transactionId}
                                     </div>
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">You • {safeFormatDate(ticket.createdAt)}</span>
                    </div>

                    {/* Replies */}
                    {ticket.responses?.map((res, idx) => {
                        const isAdmin = res.sender !== ticket.userId;
                        return (
                            <div key={idx} className={`flex flex-col space-y-2 max-w-[85%] ${isAdmin ? 'items-end ml-auto' : 'items-start'}`}>
                                <div className={`p-6 rounded-3xl text-sm leading-relaxed border ${
                                    isAdmin 
                                    ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none shadow-xl shadow-slate-200/50' 
                                    : 'bg-slate-50 text-slate-700 border-slate-100 rounded-tl-none'
                                }`}>
                                    <p>{res.message}</p>
                                </div>
                                <span className={`text-[10px] font-bold text-slate-300 uppercase tracking-widest px-2`}>
                                    {isAdmin ? 'Zantara Agent' : 'You'} • {safeFormatDate(res.createdAt)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Reply Input */}
                <div className="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100 shrink-0">
                    <form 
                        onSubmit={handleReply}
                        className="bg-white border border-slate-100 rounded-2xl p-2 flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all"
                    >
                        <input 
                            type="text"
                            value={reply}
                            disabled={ticket.status === 'resolved' || ticket.status === 'closed'}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder={ticket.status === 'resolved' ? "This ticket is resolved" : "Type your reply..."}
                            className="flex-1 bg-transparent border-0 text-sm font-medium text-slate-900 px-4 focus:ring-0 placeholder:text-slate-300 disabled:opacity-50"
                        />
                        <button 
                            type="submit"
                            disabled={!reply.trim() || isReplying || ticket.status === 'resolved' || ticket.status === 'closed'}
                            className="bg-slate-950 text-white p-3 rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center shrink-0"
                        >
                            <Send size={18} className={isReplying ? 'animate-[pulse_1s_infinite]' : ''} />
                        </button>
                    </form>
                    <div className="flex items-center justify-center gap-6 mt-4">
                         <div className="flex items-center gap-1.5 text-slate-300">
                             <ShieldCheck size={12} />
                             <span className="text-[9px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-slate-300">
                             <Clock size={12} />
                             <span className="text-[9px] font-bold uppercase tracking-widest">Agent response time: ~2h</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportTicketDetailsPage;
