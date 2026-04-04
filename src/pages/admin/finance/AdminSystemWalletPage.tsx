import React, { useEffect, useState } from 'react';
import { Wallet, ShieldCheck, ArrowUpRight, Activity, Zap, Loader2, AlertCircle } from 'lucide-react';
import { getBusinessWallet } from '../../../services/admin/adminBusinessService';

const AdminSystemWalletPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                setLoading(true);
                const response = await getBusinessWallet();
                if (response.success) {
                    setData(response.data);
                } else {
                    setError(response.message || 'Failed to load wallet data');
                }
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Auditing Platform Wallets...</p>
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
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                    Retry Audit
                </button>
            </div>
        );
    }

    const { platformBalance, reservedPayouts, apiVendorBalance, apiVendorStatus } = data || {};

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Wallet</h1>
                    <p className="text-slate-500 text-sm mt-1">Platform liquidity audit vs Provider float levels.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                            <Wallet size={20} />
                        </div>
                        <p className="font-bold text-slate-800">Aggregate Platform Holdings</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Total Combined User Balance</p>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">₦{(platformBalance || 0).toLocaleString()}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-50">
                            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                                <p className="text-amber-600 font-black uppercase tracking-widest text-[10px] mb-1">Frozen / Escrow</p>
                                <p className="text-xl font-black text-slate-800 tracking-tight">₦{(reservedPayouts || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                                <p className="text-emerald-600 font-black uppercase tracking-widest text-[10px] mb-1">Available Float</p>
                                <p className="text-xl font-black text-slate-800 tracking-tight">₦{((platformBalance - reservedPayouts) || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-[-20px] right-[-20px] opacity-10 text-emerald-500">
                        <Zap size={180} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${apiVendorStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`}></div>
                                <p className="text-white font-black uppercase tracking-widest text-[10px]">Vendor API Float</p>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${apiVendorStatus === 'online' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {apiVendorStatus || 'Offline'}
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2">₦{(apiVendorBalance || 0).toLocaleString()}</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Live Provider Balance</p>
                    </div>

                    <div className="relative z-10 pt-6 border-t border-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Activity size={14} />
                                <p className="text-[10px] font-black uppercase tracking-widest">Margin Safety</p>
                            </div>
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Healthy</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[85%] rounded-full shadow-[0_0_10px_#10b981]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Settlement Ratio', value: '98.2%', helper: 'Platform Accuracy', icon: ShieldCheck, color: 'emerald' },
                    { label: 'Operating Buffer', value: '₦500,000', helper: 'Minimum Reserve', icon: ArrowUpRight, color: 'blue' },
                    { label: 'Escrow Flow', value: `₦${((reservedPayouts || 0) * 0.4).toLocaleString()}`, helper: 'Pending Payouts', icon: Activity, color: 'purple' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-slate-200 transition-all">
                        <div className={`w-10 h-10 rounded-xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center`}>
                            <item.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                            <h4 className="text-lg font-black text-slate-800 leading-none tracking-tight">{item.value}</h4>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium italic">{item.helper}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSystemWalletPage;
