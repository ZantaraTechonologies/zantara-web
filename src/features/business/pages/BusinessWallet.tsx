import React, { useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { useBusinessStore } from '../store/businessStore';
import { StatCard } from '../components/StatCard';

const BusinessWallet: React.FC = () => {
    const { settlements, loading, fetchSettlements } = useBusinessStore();

    useEffect(() => {
        fetchSettlements();
    }, [fetchSettlements]);

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
                    <h1 className="text-2xl font-bold text-slate-900">System Wallets</h1>
                    <p className="text-slate-500">Monitor provider balances and operational funds.</p>
                </div>
                <button 
                    onClick={() => fetchSettlements()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh Balances
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Active Provider Balance" 
                    value={formatCurrency(2500000)} 
                    icon={Wallet} 
                    color="blue"
                />
                <StatCard 
                    title="Escrow / Pending Funds" 
                    value={formatCurrency(150000)} 
                    icon={ArrowUpRight} 
                    color="amber"
                />
                <StatCard 
                    title="Settled Invoices (MTD)" 
                    value={formatCurrency(4800000)} 
                    icon={ArrowDownRight} 
                    color="green"
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Provider Settlements</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Provider</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {settlements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No recent settlements found.
                                    </td>
                                </tr>
                            ) : (
                                settlements.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900">{s.provider}</td>
                                        <td className="px-6 py-4 text-slate-600">{formatCurrency(s.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {s.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {new Date(s.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 font-bold text-sm hover:underline">Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BusinessWallet;
