import React from 'react';
import { AlertTriangle, RotateCcw, TrendingDown, ShieldAlert } from 'lucide-react';
import { StatCard } from '../components/StatCard';

const BusinessRefundsLosses: React.FC = () => {
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
                    <h1 className="text-2xl font-bold text-slate-900">Refunds & Losses</h1>
                    <p className="text-slate-500">Track failed transactions, system errors, and financial leakages.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Refunds" 
                    value={formatCurrency(45000)} 
                    icon={RotateCcw} 
                    color="blue"
                />
                <StatCard 
                    title="Operational Losses" 
                    value={formatCurrency(12400)} 
                    icon={TrendingDown} 
                    color="red"
                />
                <StatCard 
                    title="Failed (No Refund Yet)" 
                    value={formatCurrency(3200)} 
                    icon={AlertTriangle} 
                    color="amber"
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-red-500">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900">High Risk Failures</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Loss Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cause</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1].map((i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 text-sm">MTN Purchase Error</span>
                                            <span className="text-slate-400 text-xs">REF-ERROR-001X</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-red-600">₦2,500.00</td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">Double debit on provider callback</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Investigation Required</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                                            Initiate Recovery
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BusinessRefundsLosses;
