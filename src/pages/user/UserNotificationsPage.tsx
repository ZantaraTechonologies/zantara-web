import React, { useState } from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';
import { Bell, CheckCheck, Calendar, Shield, Zap, CreditCard, MessageSquare, ArrowRight, Megaphone, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// ─── Broadcast Detail Modal ─────────────────────────────────────────────────────
const getBroadcastConfig = (type: string) => {
    switch (type) {
        case 'critical':
            return {
                headerBg: 'bg-red-500',
                headerBg2: 'from-red-600 to-red-400',
                icon: AlertTriangle,
                badge: 'CRITICAL ALERT',
                badgeColor: 'bg-red-100 text-red-600 border-red-200',
                border: 'border-l-red-500',
                accentBg: 'bg-red-50',
                btnBg: 'bg-red-500 hover:bg-red-600',
                iconBg: 'bg-red-100 text-red-500',
            };
        case 'warning':
            return {
                headerBg: 'bg-amber-500',
                headerBg2: 'from-amber-600 to-amber-400',
                icon: AlertTriangle,
                badge: 'IMPORTANT',
                badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
                border: 'border-l-amber-500',
                accentBg: 'bg-amber-50',
                btnBg: 'bg-amber-500 hover:bg-amber-600',
                iconBg: 'bg-amber-100 text-amber-500',
            };
        case 'success':
            return {
                headerBg: 'bg-emerald-600',
                headerBg2: 'from-emerald-700 to-emerald-500',
                icon: CheckCircle2,
                badge: 'ANNOUNCEMENT',
                badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                border: 'border-l-emerald-600',
                accentBg: 'bg-emerald-50',
                btnBg: 'bg-emerald-600 hover:bg-emerald-700',
                iconBg: 'bg-emerald-100 text-emerald-500',
            };
        default: // info
            return {
                headerBg: 'bg-emerald-600',
                headerBg2: 'from-emerald-800 to-emerald-500',
                icon: Megaphone,
                badge: 'BROADCAST',
                badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                border: 'border-l-emerald-600',
                accentBg: 'bg-emerald-50/40',
                btnBg: 'bg-emerald-600 hover:bg-emerald-700',
                iconBg: 'bg-emerald-100 text-emerald-500',
            };
    }
};

const BroadcastModal: React.FC<{ item: any; onClose: () => void }> = ({ item, onClose }) => {
    const cfg = getBroadcastConfig(item.broadcastType || 'info');
    const Icon = cfg.icon;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
                {/* Dismiss */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/35 text-white rounded-full transition-colors"
                >
                    <X size={16} />
                </button>

                {/* Colored Header */}
                <div className={`${cfg.headerBg} bg-gradient-to-br ${cfg.headerBg2} px-8 pt-10 pb-8 relative overflow-hidden flex flex-col items-center text-center`}>
                    <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

                    {/* Badge */}
                    <div className="relative z-10 flex items-center gap-1.5 bg-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-5">
                        <Icon size={10} />
                        {cfg.badge}
                    </div>

                    {/* Icon circle */}
                    <div className="relative z-10 w-20 h-20 rounded-full bg-white/20 border-2 border-white/35 flex items-center justify-center mb-5 shadow-lg">
                        <Icon size={36} className="text-white" />
                    </div>

                    <h2 className="relative z-10 text-xl font-black text-white tracking-tight leading-tight">{item.title}</h2>
                </div>

                {/* Body */}
                <div className="px-8 py-7 space-y-6">
                    <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">{item.message}</p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-300">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className={`${cfg.btnBg} text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-colors shadow-md active:scale-95`}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────
const UserNotificationsPage: React.FC = () => {
    const { data: notifications, isLoading } = useNotifications();
    const { mutate: markRead } = useMarkAsRead();
    const { mutate: markAllRead } = useMarkAllAsRead();
    const [selectedBroadcast, setSelectedBroadcast] = useState<any>(null);

    // Icon mapping based on type
    const getIcon = (type: string, isBroadcast: boolean, broadcastType?: string) => {
        if (isBroadcast) {
            if (broadcastType === 'critical' || broadcastType === 'warning') return <AlertTriangle size={20} />;
            return <Megaphone size={20} />;
        }
        switch (type) {
            case 'support': return <MessageSquare size={20} />;
            case 'transaction': return <CreditCard size={20} />;
            case 'security': return <Shield size={20} />;
            case 'service': return <Zap size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const getIconBg = (type: string, isBroadcast: boolean, broadcastType?: string) => {
        if (isBroadcast) {
            switch (broadcastType) {
                case 'critical': return 'bg-red-50 text-red-500 border-red-100';
                case 'warning': return 'bg-amber-50 text-amber-500 border-amber-100';
                case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
                default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            }
        }
        switch (type) {
            case 'support': return 'bg-blue-50 text-blue-500 border-blue-100';
            case 'transaction': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
            case 'security': return 'bg-amber-50 text-amber-500 border-amber-100';
            case 'service': return 'bg-purple-50 text-purple-500 border-purple-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    const getBroadcastAccent = (broadcastType?: string) => {
        switch (broadcastType) {
            case 'critical': return 'border-l-4 border-l-red-500 bg-red-50/30';
            case 'warning': return 'border-l-4 border-l-amber-500 bg-amber-50/30';
            case 'success': return 'border-l-4 border-l-emerald-500 bg-emerald-50/20';
            default: return 'border-l-4 border-l-emerald-500 bg-emerald-50/20';
        }
    };

    const getBroadcastBadge = (broadcastType?: string) => {
        switch (broadcastType) {
            case 'critical': return 'bg-red-100 text-red-600 border border-red-200';
            case 'warning': return 'bg-amber-100 text-amber-700 border border-amber-200';
            case 'success': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            default: return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
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
            {/* Broadcast Detail Modal */}
            {selectedBroadcast && (
                <BroadcastModal item={selectedBroadcast} onClose={() => setSelectedBroadcast(null)} />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">Stay updated with your account activity and support replies.</p>
                </div>
                
                {unreadCount > 0 && (
                    <button 
                        onClick={() => markAllRead()}
                        className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-widest hover:text-emerald-700 transition-colors"
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
                        {notifications.map((n: any) => {
                            const isBroadcast = !!n.isBroadcast;
                            return (
                                <div
                                    key={n._id}
                                    onClick={() => {
                                        if (isBroadcast) {
                                            setSelectedBroadcast(n);
                                        } else {
                                            if (!n.isRead) markRead(n._id);
                                        }
                                    }}
                                    className={`p-6 md:p-8 flex gap-6 transition-all cursor-pointer group relative
                                        ${isBroadcast
                                            ? `${getBroadcastAccent(n.broadcastType)} hover:brightness-[0.97]`
                                            : `hover:bg-slate-50/50 ${!n.isRead ? 'bg-slate-50/30' : ''}`
                                        }`}
                                >
                                    {/* Unread bar — only for regular notifications */}
                                    {!isBroadcast && !n.isRead && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-emerald-500 rounded-r-full shadow-[2px_0_8px_rgba(19,106,99,0.4)]"></div>
                                    )}
                                    
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${getIconBg(n.type, isBroadcast, n.broadcastType)}`}>
                                        {getIcon(n.type, isBroadcast, n.broadcastType)}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className={`text-sm font-bold tracking-tight transition-colors ${!n.isRead ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                                                {n.title}
                                            </h3>
                                            {/* Broadcast badge */}
                                            {isBroadcast && (
                                                <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${getBroadcastBadge(n.broadcastType)}`}>
                                                    <Megaphone size={8} />
                                                    {n.broadcastType?.toUpperCase() || 'BROADCAST'}
                                                </span>
                                            )}
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-auto shrink-0">
                                                {format(new Date(n.createdAt), 'hh:mm a')}
                                            </span>
                                        </div>
                                        <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-slate-600 font-medium' : 'text-slate-400 font-normal'} group-hover:text-slate-600 transition-colors line-clamp-2`}>
                                            {n.message}
                                        </p>
                                        <div className="pt-2 flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-slate-300">
                                                <Calendar size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{format(new Date(n.createdAt), 'MMM dd, yyyy')}</span>
                                            </div>
                                            {n.type === 'support' && !isBroadcast && (
                                                <Link 
                                                    to={`/app/support/tickets/${n.metadata?.ticketId}`} 
                                                    className="text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-600 flex items-center gap-1 group/link"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    View Ticket
                                                    <ArrowRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                                                </Link>
                                            )}
                                            {isBroadcast && (
                                                <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1">
                                                    Tap to read
                                                    <ArrowRight size={10} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
