import React from 'react';
import { 
    Users, 
    ShieldCheck, 
    ArrowUpRight, 
    AlertCircle, 
    Wallet, 
    Ticket,
    Activity,
    UserPlus,
    FileText,
    Radio,
    Zap,
    ChevronRight,
    Search,
    Bell,
    CheckCircle2
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
    const kpis = [
        { label: 'TOTAL USERS', value: '12,842', trend: '+4.2%', trendUp: true, detail: null },
        { label: 'ACTIVE USERS', value: '8,122', trend: '63%', trendUp: true, detail: null },
        { label: 'PENDING KYC', value: '42', trend: 'URGENT', trendUp: false, detail: 'Action Required', alert: true },
        { label: 'WITHDRAWALS', value: '18', trend: '$14.2k', trendUp: true, detail: null },
        { label: 'FAILED TODAY', value: '7', trend: 'ACTION!', trendUp: false, detail: null, critical: true },
        { label: 'OPEN TICKETS', value: '24', trend: '8 new', trendUp: true, detail: null },
    ];

    const toolbox = [
        { name: 'ADD ADMIN', icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { name: 'EXPORT LOGS', icon: FileText, color: 'text-slate-400', bg: 'bg-white/5' },
        { name: 'BROADCAST', icon: Radio, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { name: 'MAINTENANCE', icon: Zap, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    ];

    const criticalMonitoring = [
        { event: 'High Volume Withdrawal', entity: 'Sarah Jenkins (@sjenkins)', time: '2 mins ago', status: 'REVIEW REQUIRED', statusColor: 'bg-yellow-500/20 text-yellow-500' },
        { event: 'Multiple Auth Failures', entity: 'IP: 192.168.1.42 (HK)', time: '15 mins ago', status: 'AUTO LOCKED', statusColor: 'bg-red-500/20 text-red-500' },
    ];

    const activityStream = [
        { event: 'KYC Approved', detail: 'Admin Mark approved user #8421', time: '1 HOUR AGO', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { event: 'System Scaled', detail: 'Node Cluster #4 auto-scaled successfully', time: '3 HOURS AGO', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { event: 'Failed Payout', detail: 'Blockchain network congestion detected', time: '5 HOURS AGO', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    ];

    return (
        <div className="bg-slate-950 min-h-screen font-['Inter',_sans-serif] text-slate-300">
            {/* System Status Banner Simulation */}
            <div className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] py-2 text-center flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-950 rounded-full animate-ping"></div>
                ALL SYSTEMS OPERATIONAL: ZANTARA CLOUD INFRASTRUCTURE HEALTHY
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
                        <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">L3 Access: Verified System Administrator</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em]">Live Connection</span>
                        </div>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {kpis.map((kpi, i) => (
                        <div key={i} className={`bg-white/5 border p-5 rounded-2xl shadow-sm space-y-3 hover:border-emerald-500/30 transition-all group ${kpi.critical ? 'border-red-500/20 bg-red-500/5' : 'border-white/5'}`}>
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</span>
                                {kpi.alert && <AlertCircle className="text-orange-500 w-4 h-4 animate-bounce" />}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-xl font-bold tracking-tight ${kpi.critical ? 'text-red-500' : 'text-white'}`}>{kpi.value}</span>
                                <span className={`text-[11px] font-black ${kpi.trendUp ? 'text-emerald-500' : kpi.critical ? 'text-red-500' : 'text-orange-500'}`}>
                                    {kpi.trend}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Side - Charts and Tables */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Transaction Volume Placeholder */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Transaction Volume</h3>
                                    <p className="text-sm text-slate-500 font-medium">Weekly performance overview</p>
                                </div>
                                <div className="flex bg-white/5 p-1.5 rounded-xl">
                                    <button className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">Weekly</button>
                                    <button className="px-5 py-2 text-xs font-bold bg-emerald-500 text-slate-950 rounded-lg shadow-sm">Monthly</button>
                                </div>
                            </div>
                            <div className="h-[300px] w-full bg-emerald-500/5 rounded-3xl border border-dashed border-emerald-500/20 flex items-center justify-center overflow-hidden">
                                {/* Visual simulation of a line chart */}
                                <svg className="w-full h-full p-4" viewBox="0 0 800 300">
                                    <path 
                                        d="M0,200 Q100,220 200,150 T400,100 T600,180 T800,50" 
                                        fill="none" 
                                        stroke="#10b981" 
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        className="animate-draw"
                                    />
                                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.1 }} />
                                        <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
                                    </linearGradient>
                                    <path 
                                        d="M0,200 Q100,220 200,150 T400,100 T600,180 T800,50 L800,300 L0,300 Z" 
                                        fill="url(#grad)" 
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Critical Monitoring */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-bold text-white">Critical Monitoring</h3>
                                    <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-red-500/20">
                                        2 Action Items
                                    </span>
                                </div>
                                <button className="text-emerald-400 font-bold text-sm tracking-tight hover:underline flex items-center gap-1 group">
                                    View Monitoring Pool
                                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Event Context</th>
                                            <th className="text-left py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Associated Entity</th>
                                            <th className="text-left py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                                            <th className="text-left py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Risk Status</th>
                                            <th className="text-right py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Operation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {criticalMonitoring.map((row, i) => (
                                            <tr key={i} className="group hover:bg-white/5 transition-colors">
                                                <td className="py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-orange-400' : 'bg-red-500'}`}></div>
                                                        <span className="text-sm font-bold text-slate-300">{row.event}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 font-mono text-xs text-slate-500">{row.entity}</td>
                                                <td className="py-3.5 text-xs text-slate-500 font-medium">{row.time}</td>
                                                <td className="py-3.5">
                                                    <span className={`${row.statusColor} text-[10px] font-bold px-3 py-1 rounded-lg tracking-widest opacity-80`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-right">
                                                    <button className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-emerald-400 transition-all shadow-sm">
                                                        {i === 0 ? 'Investigate' : 'Unlock/Verify'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Tools and Feed */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Admin Toolbox */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-white mb-5">Admin Toolbox</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {toolbox.map((tool, i) => (
                                    <button key={i} className={`flex flex-col items-center justify-center gap-3 border p-4 rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-1 group bg-white/5 border-white/5`}>
                                        <div className={`${tool.color} transition-transform group-hover:scale-110 opacity-80 group-hover:opacity-100`}>
                                            <tool.icon size={22} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{tool.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Activity Stream */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-white mb-5">Activity Stream</h3>
                            <div className="space-y-5">
                                {activityStream.map((item, i) => (
                                    <div key={i} className="flex gap-3 group">
                                        <div className="relative">
                                            <div className={`w-9 h-9 bg-white/5 ${item.color} rounded-xl flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 opacity-80 group-hover:opacity-100 shrink-0`}>
                                                <item.icon size={16} />
                                            </div>
                                            {i !== activityStream.length - 1 && (
                                                <div className="absolute top-9 bottom-[-20px] left-1/2 w-px bg-white/5 -translate-x-1/2"></div>
                                            )}
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="font-bold text-slate-200 text-sm">{item.event}</h4>
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.detail}</p>
                                            <p className="text-[10px] font-bold text-slate-600 tracking-widest">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
