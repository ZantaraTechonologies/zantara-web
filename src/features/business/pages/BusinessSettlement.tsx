import React from 'react';
import { CheckCircle, Clock, ExternalLink, HelpCircle } from 'lucide-react';

const BusinessSettlement: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Provider Settlements</h1>
                    <p className="text-slate-500">Reconcile payments with upstream providers (VTpass, ClubKonnect, etc.)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-blue-100 text-sm font-medium">Unsettled Balance</p>
                        <h3 className="text-3xl font-bold mt-1">₦84,200.00</h3>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-200 bg-blue-700/50 w-fit px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            Due in 2 days
                        </div>
                    </div>
                    <CheckCircle className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
                </div>
                {/* Add more summary cards if needed */}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Reconciliation Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Provider</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statement Period</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Our Record</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Provider Record</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2].map((i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-slate-900">{i === 1 ? 'VTpass' : 'ClubKonnect'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">March 1st - March 15th</td>
                                    <td className="px-6 py-4 font-bold text-slate-700">₦1,240,000</td>
                                    <td className="px-6 py-4 font-bold text-slate-700">₦1,240,000</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-wider">
                                            <CheckCircle className="w-4 h-4" />
                                            Matched
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            <tr className="hover:bg-slate-50/50 transition-colors bg-red-50/30">
                                <td className="px-6 py-4">
                                    <span className="font-bold text-slate-900">Gloworld API</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-sm">March 14th - March 18th</td>
                                <td className="px-6 py-4 font-bold text-slate-700">₦45,000</td>
                                <td className="px-6 py-4 font-bold text-red-600">₦48,500</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                                        <HelpCircle className="w-4 h-4" />
                                        Mismatched
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">
                                        Resolve
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BusinessSettlement;
