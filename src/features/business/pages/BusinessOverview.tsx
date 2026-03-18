import React, { useEffect } from 'react';
import { 
    LayoutDashboard, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    CreditCard, 
    AlertCircle 
} from 'lucide-react';
import { useBusinessStore } from '../store/businessStore';
import { StatCard } from '../components/StatCard';

const BusinessOverview: React.FC = () => {
    const { summary, loading, fetchSummary } = useBusinessStore();

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(val);
    };

    if (loading && !summary.totalRevenue) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Business Overview</h1>
                    <p className="text-slate-500">Track your platform's financial performance and profitability.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                        Download Report
                    </button>
                    <button className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={formatCurrency(summary.totalRevenue)} 
                    icon={TrendingUp} 
                    color="green"
                    trend={{ value: '12.5%', isPositive: true }}
                />
                <StatCard 
                    title="Total Cost" 
                    value={formatCurrency(summary.totalCost)} 
                    icon={CreditCard} 
                    color="blue"
                />
                <StatCard 
                    title="Gross Profit" 
                    value={formatCurrency(summary.totalProfit)} 
                    icon={DollarSign} 
                    color="purple"
                    trend={{ value: '8.2%', isPositive: true }}
                />
                <StatCard 
                    title="Operational Expenses" 
                    value={formatCurrency(summary.totalExpenses)} 
                    icon={TrendingDown} 
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Profit Analytics</h3>
                        <select className="bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-600 px-3 py-1.5 focus:ring-2 focus:ring-blue-500">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last Quarter</option>
                        </select>
                    </div>
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
                        <p className="text-slate-400">Profit trend chart will be displayed here</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Net Profit Margin</h3>
                    <div className="flex flex-col items-center justify-center h-[300px]">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle className="text-slate-100 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                                <circle 
                                    className="text-blue-600 stroke-current" 
                                    strokeWidth="8" 
                                    strokeLinecap="round" 
                                    fill="transparent" 
                                    r="40" 
                                    cx="50" 
                                    cy="50" 
                                    strokeDasharray={`${(summary.netProfit / (summary.totalRevenue || 1)) * 251.2}, 251.2`}
                                    transform="rotate(-90 50 50)" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-slate-900">
                                    {summary.totalRevenue ? Math.round((summary.netProfit / summary.totalRevenue) * 100) : 0}%
                                </span>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Margin</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Recent Financial Activity</h3>
                    <button className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors">
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Channel</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cost</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Selling Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    No recent activity found.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BusinessOverview;
