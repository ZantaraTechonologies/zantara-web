import React from 'react';
import { useMyTickets } from '../../hooks/useSupport';
import { MessageSquare, Plus, Clock, CheckCircle2, AlertCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'open':
            return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">Open</span>;
        case 'in-progress':
            return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100">In Progress</span>;
        case 'resolved':
            return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">Resolved</span>;
        default:
            return <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-100">{status}</span>;
    }
};

const SupportCenterPage: React.FC = () => {
    const { data: tickets, isLoading } = useMyTickets();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Support Center
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">Need help? We're here to assist you with any issues.</p>
                </div>
                
                <Link 
                    to="/app/support/create"
                    className="flex items-center gap-2 bg-slate-950 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-emerald-500 hover:text-slate-950 transition-all active:scale-95 w-fit"
                >
                    <Plus size={18} />
                    New Support Ticket
                </Link>
            </div>

            {/* Quick Links / Help */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:border-emerald-100 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                        <HelpCircle size={24} className="text-emerald-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Frequently Asked Questions</h3>
                        <p className="text-xs text-slate-400 mt-1">Get instant answers to common questions about funding and services.</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:border-emerald-100 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                        <MessageSquare size={24} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Live Chat Support</h3>
                        <p className="text-xs text-slate-400 mt-1">Chat directly with a Zantara agent for real-time problem resolution.</p>
                    </div>
                </div>
            </div>

            {/* Ticket List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                    <Clock size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-800">Support History</h3>
                </div>

                <div className="divide-y divide-slate-50">
                    {tickets && tickets.length > 0 ? (
                        tickets.map((t) => (
                            <Link 
                                key={t._id}
                                to={`/app/support/tickets/${t._id}`}
                                className="p-6 md:p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all group"
                            >
                                <div className="space-y-1.5 min-w-0 flex-1 pr-8">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{t.subject}</h4>
                                        <StatusBadge status={t.status} />
                                    </div>
                                    <p className="text-xs text-slate-400 truncate max-w-md">{t.message}</p>
                                    <div className="flex items-center gap-4 pt-1">
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            <AlertCircle size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{t.priority} Priority</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{format(new Date(t.createdAt), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-100">
                                <MessageSquare size={40} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-slate-400">No active tickets</h3>
                                <p className="text-xs text-slate-400 max-w-[200px] mx-auto italic">"If you ever run into trouble, your support history will appear here."</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportCenterPage;
