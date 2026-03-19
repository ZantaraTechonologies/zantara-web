import React from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';
import { Bell, CheckCheck, Trash2, Calendar, ShieldInfo, Zap, CreditCard, MessageSquare, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const UserNotificationsPage: React.FC = () => {
    const { data: notifications, isLoading } = useNotifications();
    const { mutate: markRead } = useMarkAsRead();
    const { mutate: markAllRead } = useMarkAllAsRead();

    // Icon mapping based on type
    const getIcon = (type: string) => {
        switch (type) {
            case 'support': return <MessageSquare size={20} />;
            case 'transaction': return <CreditCard size={20} />;
            case 'security': return <ShieldInfo size={20} />;
            case 'service': return <Zap size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'support': return 'bg-blue-50 text-blue-500 border-blue-100';
            case 'transaction': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
            case 'security': return 'bg-amber-50 text-amber-500 border-amber-100';
            case 'service': return 'bg-purple-50 text-purple-500 border-purple-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">Stay updated with your account activity and support replies.</p>
                </div>
                
                {unreadCount > 0 && (
                    <button 
                        onClick={() => markAllRead()}
                        className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest hover:text-emerald-700 transition-colors"
                    >
                        <CheckCheck size={16} />
                        Mark all as read
                    </button>
                )}
            </div>

            {/* List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                {notifications && notifications.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                            <div 
                                key={n._id}
                                onClick={() => !n.isRead && markRead(n._id)}
                                className={`p-6 md:p-8 flex gap-6 hover:bg-slate-50/50 transition-all cursor-pointer group relative ${!n.isRead ? 'bg-slate-50/30' : ''}`}
                            >
                                {!n.isRead && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-emerald-500 rounded-r-full shadow-[2px_0_8px_rgba(16,185,129,0.4)]"></div>
                                )}
                                
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${getBgColor(n.type)}`}>
                                    {getIcon(n.type)}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className={`text-sm font-bold tracking-tight transition-colors ${!n.isRead ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>{n.title}</h3>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest shrink-0">
                                            {format(new Date(n.createdAt), 'hh:mm a')}
                                        </span>
                                    </div>
                                    <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-slate-600 font-medium' : 'text-slate-400 font-normal'} group-hover:text-slate-600 transition-colors`}>
                                        {n.message}
                                    </p>
                                    <div className="pt-2 flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            <Calendar size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{format(new Date(n.createdAt), 'MMM dd, yyyy')}</span>
                                        </div>
                                        {n.type === 'support' && (
                                            <Link 
                                                to={`/app/support/tickets/${n.metadata?.ticketId}`} 
                                                className="text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-600 flex items-center gap-1 group/link"
                                            >
                                                View Ticket
                                                <ArrowRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-100 border border-slate-50">
                            <Bell size={48} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900">All caught up</h3>
                            <p className="text-slate-400 text-sm font-medium max-w-[240px] italic">"The silence is golden. We'll alert you when something important happens."</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserNotificationsPage;
