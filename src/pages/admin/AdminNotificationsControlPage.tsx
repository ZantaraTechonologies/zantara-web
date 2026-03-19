import React, { useState, useEffect } from 'react';
import { 
    Bell, 
    Search, 
    Plus, 
    Send, 
    History, 
    Trash2, 
    Clock, 
    Settings,
    Radio,
    Zap,
    Users,
    ChevronRight,
    CheckCircle2
} from 'lucide-react';
import * as notificationService from '../../services/notifications/notificationService';
import { CardSkeleton, ListSkeleton } from '../../components/feedback/Skeletons';
import { toast } from 'react-toastify';

const AdminNotificationsControlPage: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState('history');

    // Stats
    const stats = [
        { label: 'DELIVERED', value: '42.8k', icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'AUTO ALERTS', value: '18', icon: Zap, color: 'text-emerald-400' },
        { label: 'PENDING', value: '0', icon: Clock, color: 'text-slate-400' },
    ];

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            // Assuming this service exists or we'll create the admin version
            const data = await (notificationService as any).fetchAdminNotifications?.() || [];
            setNotifications(data);
        } catch (err) {
            toast.error("Failed to load notification history");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Notification Terminal</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Global broadcast & system alerts</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'history' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500'
                        }`}
                    >
                        History
                    </button>
                    <button 
                        onClick={() => setActiveTab('broadcast')}
                        className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'broadcast' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500'
                        }`}
                    >
                        New Broadcast
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center gap-5 group hover:border-emerald-500/20 transition-all">
                        <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 ${s.color} transition-transform group-hover:scale-110`}>
                            <s.icon size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {activeTab === 'history' ? (
                <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recent Dispatches</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {loading ? (
                            <ListSkeleton items={5} />
                        ) : notifications.length === 0 ? (
                            <div className="py-20 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">No previous broadcasts</div>
                        ) : (
                            notifications.map((n: any) => (
                                <div key={n.id} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                                            <Radio size={18} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-slate-200 tracking-tight">{n.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium line-clamp-1">{n.message}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                            <p>{n.sentBy}</p>
                                            <p className="text-slate-700">{n.createdAt}</p>
                                        </div>
                                        <button className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-white tracking-tight">Global System Broadcast</h3>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Dispatch Title</label>
                          <input 
                              type="text" 
                              placeholder="e.g. System Maintenance Update"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Broadcast Content</label>
                          <textarea 
                              rows={4}
                              placeholder="Enter message for all active users..."
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                          />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <Radio size={20} className="text-emerald-500 animate-pulse" />
                            <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest leading-relaxed">
                                This message will be pushed instantly to all active Zantara node connections.
                            </p>
                        </div>

                        <button 
                            className="w-full py-4 bg-emerald-500 text-slate-950 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3 group"
                        >
                            <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Initiate Global Dispatch
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotificationsControlPage;
