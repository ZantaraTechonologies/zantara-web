import React from 'react';
import { Link } from 'react-router-dom';
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
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { useAdminStore } from '../../store/admin/adminStore';
import { useWalletStore } from '../../store/wallet/walletStore';
import { CardSkeleton, ListSkeleton } from '../../components/feedback/Skeletons';

const AdminDashboardPage: React.FC = () => {
    const { stats, loadingStats, fetchDashboardStats, error, pendingKycCount, pendingWithdrawalsCount } = useAdminStore();
    const { currency } = useWalletStore();

    React.useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    const { fetchBalance } = useWalletStore();
    React.useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const kpis = [
        { label: 'TOTAL USERS', value: stats?.totalUsers?.toLocaleString() || '0', trend: stats?.userGrowth || '0%', trendUp: true, detail: null, link: '/admin/users' },
        { label: 'ACTIVE USERS', value: stats?.activeUsers?.toLocaleString() || '0', trend: stats?.activityRate || '0%', trendUp: true, detail: null, link: '/admin/users' },
        { label: 'PENDING KYC', value: stats?.pendingKyc?.toString() || '0', trend: 'URGENT', trendUp: false, detail: 'Action Required', alert: (stats?.pendingKyc || 0) > 0, link: '/admin/kyc' },
        { label: 'WITHDRAWALS', value: stats?.pendingWithdrawals?.toString() || '0', trend: `${currency}${stats?.withdrawalVolume?.toLocaleString() || '0'}`, trendUp: true, detail: null, link: '/admin/withdrawals' },
        { label: 'FAILED TODAY', value: stats?.failedTxsToday?.toString() || '0', trend: 'CHECK LOGS', trendUp: false, detail: null, critical: (stats?.failedTxsToday || 0) > 0, link: '/admin/transactions' },
        { label: 'OPEN TICKETS', value: stats?.openTickets?.toString() || '0', trend: 'SUPPORT', trendUp: true, detail: null, link: '/admin/support' },
    ];

    const toolbox = [
        { name: 'ADD ADMIN', icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10', link: '/admin/register' },
        { name: 'EXPORT LOGS', icon: FileText, color: 'text-slate-400', bg: 'bg-white/5', link: '/admin/audit' },
        { name: 'BROADCAST', icon: Radio, color: 'text-emerald-400', bg: 'bg-emerald-500/10', link: '/admin/notifications' },
        { name: 'MAINTENANCE', icon: Zap, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', link: '/admin/status' },
    ];

    const criticalMonitoring = (stats?.criticalAlerts || []);



    return (
        <div className="bg-slate-950 min-h-screen font-sans text-slate-300">
            {/* System Status Banner Simulation */}
            <div className="bg-emerald-500 text-slate-950 text-[10px] font-bold uppercase tracking-[0.3em] py-2 text-center flex items-center justify-center gap-2">
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

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="text-red-500 font-bold text-sm">Dashboard Sync Error</p>
                            <p className="text-red-400/70 text-xs">{error}. Please ensure your local backend is running and the .env is correctly configured.</p>
                        </div>
                    </div>
                )}

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {loadingStats ? (
                        Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
                    ) : kpis.map((kpi, i) => (
                        <Link to={kpi.link} key={i} className={`bg-white/5 border p-5 rounded-2xl shadow-sm space-y-3 hover:border-emerald-500/30 transition-all group block ${kpi.critical ? 'border-red-500/20 bg-red-500/5' : 'border-white/5'}`}>
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</span>
                                {kpi.alert && <AlertCircle className="text-orange-500 w-4 h-4 animate-bounce" />}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-xl font-bold tracking-tight ${kpi.critical ? 'text-red-500' : 'text-white'}`}>{kpi.value}</span>
                                <span className={`text-[11px] font-bold ${kpi.trendUp ? 'text-emerald-500' : kpi.critical ? 'text-red-500' : 'text-orange-500'}`}>
                                    {kpi.trend}
                                </span>
                            </div>
                        </Link>
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
                                {stats?.transactionTrend && stats.transactionTrend.length > 0 ? (
                                    <svg className="w-full h-full p-4" viewBox="0 0 800 300" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.2 }} />
                                                <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
                                            </linearGradient>
                                        </defs>
                                        {(() => {
                                            const trend = stats.transactionTrend;
                                            const maxVal = Math.max(...trend.map((t: any) => t.value), 5);
                                            const points = trend.map((t: any, i: number) => {
                                                const x = (i * 800) / (trend.length - 1 || 1);
                                                const y = 300 - (t.value / maxVal) * 200 - 50; // Leave 50px padding top/bottom
                                                return { x, y };
                                            });
                                            const d = `M${points.map((p: any) => `${p.x},${p.y}`).join(' L')}`;
                                            const areaD = `${d} L${points[points.length - 1].x},300 L${points[0].x},300 Z`;
                                            
                                            return (
                                                <>
                                                    <path d={areaD} fill="url(#grad)" />
                                                    <path 
                                                        d={d} 
                                                        fill="none" 
                                                        stroke="#10b981" 
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="animate-draw"
                                                    />
                                                    {points.map((p: any, i: number) => (
                                                        <g key={i} className="group/point">
                                                            <circle cx={p.x} cy={p.y} r="4" fill="#10b981" className="opacity-0 group-hover/point:opacity-100 transition-opacity" />
                                                            <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] fill-emerald-400 opacity-0 group-hover/point:opacity-100 transition-opacity font-bold">
                                                                {trend[i].value}
                                                            </text>
                                                        </g>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </svg>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                        <Activity size={40} className="text-emerald-500" />
                                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Awaiting Pulse Data</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Critical Monitoring */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-bold text-white">Critical Monitoring</h3>
                                    <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-red-500/20">
                                        {pendingKycCount + pendingWithdrawalsCount} Action Items
                                    </span>
                                </div>
                                <Link to="/admin/status" className="text-emerald-400 font-bold text-sm tracking-tight hover:underline flex items-center gap-1 group">
                                    View Monitoring Pool
                                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                </Link>
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
                                        {stats?.criticalAlerts?.map((row: any, i: number) => (
                                            <tr key={i} className="group hover:bg-white/5 transition-colors">
                                                <td className="py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${row.statusColor.includes('red') ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                                                        <span className="text-sm font-bold text-slate-300">{row.event}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 font-mono text-xs text-slate-500">{row.entity}</td>
                                                <td className="py-3.5 text-xs text-slate-500 font-medium">
                                                    {new Date(row.time).toLocaleDateString()}
                                                </td>
                                                <td className="py-3.5">
                                                    <span className={`${row.statusColor} text-[10px] font-bold px-3 py-1 rounded-lg tracking-widest opacity-80`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-right">
                                                    {row.link ? (
                                                        <Link to={row.link} className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-emerald-400 transition-all shadow-sm inline-block">
                                                            Investigate
                                                        </Link>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-600 italic">None</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!stats?.criticalAlerts || stats.criticalAlerts.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center text-slate-500 text-xs font-medium">
                                                    No critical alerts pending investigative action.
                                                </td>
                                            </tr>
                                        )}
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
                                    <Link to={tool.link} key={i} className={`flex flex-col items-center justify-center gap-3 border p-4 rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-1 group bg-white/5 border-white/5 block w-full`}>
                                        <div className={`${tool.color} transition-transform group-hover:scale-110 opacity-80 group-hover:opacity-100`}>
                                            <tool.icon size={22} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{tool.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Activity Stream */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-white mb-5">Activity Stream</h3>
                            {loadingStats ? (
                                <ListSkeleton count={4} />
                            ) : (
                                <div className="space-y-5">
                                    {(stats?.recentActivity || []).map((item: any, i: number) => (
                                        <div key={i} className="flex gap-3 group">
                                            <div className="relative">
                                                <div className={`w-9 h-9 bg-white/5 ${item.type === 'error' ? 'text-red-500' : 'text-emerald-500'} rounded-xl flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 opacity-80 group-hover:opacity-100 shrink-0`}>
                                                    {item.type === 'kyc' && <ShieldCheck size={16} />}
                                                    {item.type === 'system' && <Activity size={16} />}
                                                    {item.type === 'error' && <AlertCircle size={16} />}
                                                    {!['kyc', 'system', 'error'].includes(item.type) && <Zap size={16} />}
                                                </div>
                                                {i !== (stats?.recentActivity?.length || 0) - 1 && (
                                                    <div className="absolute top-9 bottom-[-20px] left-1/2 w-px bg-white/5 -translate-x-1/2"></div>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="font-bold text-slate-200 text-sm">{item.event}</h4>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.detail}</p>
                                                <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">
                                                    {new Date(item.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                                        <p className="text-xs text-slate-500 text-center py-4">No recent activity detected.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
