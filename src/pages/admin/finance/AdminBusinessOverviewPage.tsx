import React, { useEffect, useState } from 'react';
import { BadgeDollarSign, Users, Activity, TrendingUp, BarChart3, Wallet as WalletIcon, Loader2, AlertCircle } from 'lucide-react';
import { getBusinessOverview } from '../../../services/admin/adminBusinessService';

const AdminBusinessOverviewPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                setLoading(true);
                const response = await getBusinessOverview();
                if (response.success) {
                    setData(response.data);
                } else {
                    setError(response.message || 'Failed to load business data');
                }
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Hydrating Business Model...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-rose-500">
                <AlertCircle className="w-12 h-12" />
                <p className="font-bold uppercase tracking-widest text-xs text-center">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const { totalRevenue, totalCost, grossProfit, totalExpenses, netProfit, recentActivities } = data || {};

    const stats = [
        { title: 'Total Revenue', value: `₦${(totalRevenue || 0).toLocaleString()}`, icon: BadgeDollarSign, color: 'emerald' },
        { title: 'Cost of Sales', value: `₦${(totalCost || 0).toLocaleString()}`, icon: WalletIcon, color: 'blue' },
        { title: 'Gross Profit', value: `₦${(grossProfit || 0).toLocaleString()}`, icon: TrendingUp, color: 'purple' },
        { title: 'Operating Margin', value: `${totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%`, icon: Activity, color: 'amber' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">Real-time platform financial health and performance indicators.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-slate-200 transition-all">
                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-800">Recent Financial Flow</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Activity</span>
                        </div>
                    </div>
                    {recentActivities && recentActivities.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivities.map((txn: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs">
                                            {txn.type?.[0]?.toUpperCase() || 'T'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 capitalize">{txn.type}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">#{txn.transactionId}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-800">₦{txn.amount?.toLocaleString()}</p>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Success</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center opacity-50">
                            <Activity className="w-12 h-12 text-slate-200 mb-2" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Recent Transactions</p>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp size={150} />
                    </div>
                    <div className="relative z-10 text-center">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Net Corporate Performance</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter">₦{(netProfit || 0).toLocaleString()}</h2>
                        <div className="mt-8 pt-8 border-t border-slate-800/50">
                            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-1">Deducted (Expenses)</p>
                            <p className="text-rose-400 font-bold text-lg tracking-tight">-₦{(totalExpenses || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBusinessOverviewPage;
