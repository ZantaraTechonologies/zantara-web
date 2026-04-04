import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Download, PieChart, ShieldCheck, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { getProfitAnalytics } from '../../../services/admin/adminBusinessService';

const AdminProfitAnalyticsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getProfitAnalytics();
            if (response.success) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to calculate margins');
            }
        } catch (err: any) {
            setError(err.message || 'Analytics engine offline');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Processing Global Margins...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-rose-500">
                <AlertCircle className="w-12 h-12" />
                <p className="font-bold uppercase tracking-widest text-xs text-center">{error}</p>
            </div>
        );
    }

    const { totalRevenue, totalCost, netProfit, marginPercentage, breakdown } = data || {};

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profit Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1">Granular margin tracking across Wholesale vs Retail pricing layers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                        <Download size={16} />
                        Export
                    </button>
                    <button 
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm shadow-slate-900/20"
                    >
                        <BarChart3 size={16} />
                        Recalculate
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-[-40px] right-[-40px] p-8 opacity-5 text-emerald-500">
                        <TrendingUp size={240} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-slate-500 font-extrabold uppercase tracking-[0.2em] text-[10px] mb-3">Net Corporate Yield</p>
                        <h2 className="text-6xl font-black text-white tracking-tighter mb-8">₦{(netProfit || 0).toLocaleString()}</h2>
                        
                        <div className="flex items-center gap-8 pt-8 border-t border-slate-800/50">
                            <div>
                                <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-1">Gross Revenue</p>
                                <p className="text-white font-black text-xl tracking-tight">₦{(totalRevenue || 0).toLocaleString()}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-800"></div>
                            <div>
                                <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-1">Wholesale Cost</p>
                                <p className="text-slate-300 font-black text-xl tracking-tight">₦{(totalCost || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 shadow-inner">
                            <ShieldCheck className="text-emerald-500" size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg tracking-tight">Margin Health</h3>
                        <p className="text-sm text-slate-400 mt-2 font-medium">Checking markup validity against vendor base rates.</p>
                    </div>
                    <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield Index</span>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{(marginPercentage || 0).toFixed(2)}% Healthy</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                            <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                style={{ width: `${Math.min(marginPercentage || 0, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <PieChart size={18} className="text-slate-400" />
                        Categorical Profit Breakdown
                    </h3>
                </div>
                
                {breakdown && breakdown.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-50">
                        {breakdown.map((item: any, idx: number) => (
                            <div key={idx} className="bg-white p-8 group hover:bg-slate-50/50 transition-all cursor-default">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-8 bg-slate-900 rounded-full group-hover:bg-emerald-500 transition-colors"></div>
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-widest capitalize">{item._id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900 tracking-tighter">₦{item.profit?.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.count} Txns</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-slate-900 rounded-full transition-all duration-1000" 
                                            style={{ width: `${(item.profit / netProfit) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 w-8">
                                        {((item.profit / netProfit) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center opacity-30">
                        <PieChart size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="font-black uppercase tracking-widest text-[10px] text-slate-500">No categorical data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProfitAnalyticsPage;
