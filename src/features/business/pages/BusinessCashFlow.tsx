import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Filter, Calendar } from 'lucide-react';
import { StatCard } from '../components/StatCard';

const BusinessCashFlow: React.FC = () => {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(val);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Cash Flow</h1>
                    <p className="text-slate-500">Monitor real-time inflow and outflow of funds across the system.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                        <Calendar className="w-4 h-4" />
                        Custom Range
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Inflow" 
                    value={formatCurrency(15240000)} 
                    icon={ArrowDownLeft} 
                    color="green"
                />
                <StatCard 
                    title="Total Outflow" 
                    value={formatCurrency(12800000)} 
                    icon={ArrowUpRight} 
                    color="red"
                />
                <StatCard 
                    title="Net Cash Position" 
                    value={formatCurrency(2440000)} 
                    icon={TrendingUp} 
                    color="blue"
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Cash Flow History</h3>
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date/Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-slate-900">{i % 2 === 0 ? 'User Funding' : 'VTU Purchase'}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">REF-928374{i}</td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                            i % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {i % 2 === 0 ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                            {i % 2 === 0 ? 'INFLOW' : 'OUTFLOW'}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 font-bold ${i % 2 === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                                        {i % 2 === 0 ? '+' : '-'}{formatCurrency(i * 1200)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">Today, 04:2{i} PM</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BusinessCashFlow;
