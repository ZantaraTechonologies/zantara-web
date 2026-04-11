import React, { useEffect, useState } from 'react';
import { 
    Wallet, 
    ShieldCheck, 
    ArrowUpRight, 
    Activity, 
    Zap, 
    Loader2, 
    AlertCircle,
    Globe,
    CreditCard,
    DollarSign,
    RefreshCcw,
    TrendingDown,
    Lock,
    ExternalLink
} from 'lucide-react';
import { getBusinessWallet } from '../../../services/admin/adminBusinessService';
import { toast } from 'react-hot-toast';

const AdminSystemWalletPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

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

    useEffect(() => {
        fetchWalletData();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Auditing Platform Equity Tokens...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 text-rose-500">
                <div className="p-6 rounded-full bg-rose-500/10 border border-rose-500/20">
                    <AlertCircle className="w-12 h-12" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Audit Synchronization Failed</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
                </div>
                <button 
                    onClick={fetchWalletData}
                    className="px-8 py-3 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                >
                    Retry Deep Audit
                </button>
            </div>
        );
    }

    const { 
        platformBalance, 
        reservedPayouts, 
        apiVendorBalance, 
        apiVendorStatus,
        gatewayBalance,
        gatewayStatus,
        operatingBuffer
    } = data || {};

    const availableFloat = platformBalance - reservedPayouts;
    const totalLiquidAssets = (apiVendorBalance || 0) + (gatewayBalance || 0);
    const liquidityRatio = platformBalance > 0 ? (totalLiquidAssets / platformBalance) : 0;
    
    // Health logic
    const healthStatus = liquidityRatio >= 1 ? 'Optimal' : liquidityRatio > 0.5 ? 'Moderate' : 'Critical';
    const healthColor = liquidityRatio >= 1 ? 'emerald' : liquidityRatio > 0.5 ? 'amber' : 'rose';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Real-time Finance Engine</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">System Liquidity</h1>
                    <p className="text-slate-500 text-xs font-medium mt-2 max-w-lg">
                        Multi-pillar audit tracking the lifecycle of capital from <span className="text-indigo-400">Payment Gateways</span> to <span className="text-emerald-400">Provider Inventory</span>.
                    </p>
                </div>
                <button 
                    onClick={fetchWalletData}
                    className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                    <RefreshCcw size={16} /> Re-Sync Nodes
                </button>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Gateway Pillar (Incoming) */}
                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-[-20px] right-[-20px] opacity-5 text-indigo-500 group-hover:scale-110 transition-transform duration-700">
                        <CreditCard size={200} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight leading-none mb-1">Gateway Flow</h3>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Paystack Settlement</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${gatewayStatus === 'online' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {gatewayStatus === 'online' ? 'Connected' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-8">
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tighter mb-1 tabular-nums">₦{(gatewayBalance || 0).toLocaleString()}</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <TrendingDown size={12} className="text-indigo-400" /> Pending Settlement
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 font-bold">Standard Payout</span>
                                    <span className="text-white font-black">T+1 Day</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[70%] animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Provider Pillar (Stock) */}
                <div className="bg-slate-900 border border-indigo-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl shadow-indigo-500/5">
                    <div className="absolute top-[-20px] right-[-20px] opacity-10 text-emerald-500 group-hover:scale-110 transition-transform duration-700">
                        <Zap size={200} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight leading-none mb-1">Vendor Stock</h3>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Active Provider Float</p>
                                </div>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${apiVendorStatus === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {apiVendorStatus === 'online' ? 'Optimal' : 'Error'}
                            </span>
                        </div>

                        <div className="flex-1 space-y-8">
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tighter mb-1 tabular-nums">₦{(apiVendorBalance || 0).toLocaleString()}</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <ArrowUpRight size={12} className="text-emerald-400" /> Live Inventory
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <Activity size={12} className="text-slate-400" />
                                        <span className="text-slate-500 font-bold uppercase tracking-widest">Margin Safety</span>
                                    </div>
                                    <span className="text-emerald-400 font-bold">85% Clear</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[85%] rounded-full shadow-[0_0_10px_#10b981]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Liability Pillar (Users) */}
                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-[-20px] right-[-20px] opacity-5 text-slate-500 group-hover:scale-110 transition-transform duration-700">
                        <Wallet size={200} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-slate-400">
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight leading-none mb-1">User Wallets</h3>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Platform Liabilities</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                                Internal
                            </span>
                        </div>

                        <div className="flex-1 space-y-8">
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tighter mb-1 tabular-nums">₦{(platformBalance || 0).toLocaleString()}</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Lock size={12} className="text-amber-500" /> Aggregate Holdings
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                    <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-1">Escrow</p>
                                    <p className="text-base font-black text-white">₦{(reservedPayouts || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mb-1">Active Float</p>
                                    <p className="text-base font-black text-white">₦{(availableFloat || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Health Meter & Sub-stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Liquidity Health Gauge */}
                <div className="lg:col-span-3 bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full"></div>
                    
                    <div className="relative shrink-0 flex items-center justify-center">
                        <svg className="w-48 h-48 transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-slate-800"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={552.92}
                                strokeDashoffset={552.92 - (Math.min(liquidityRatio, 1) * 552.92)}
                                className={`text-${healthColor}-500 transition-all duration-1000 ease-out`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-black text-white tracking-tighter italic">{(liquidityRatio * 100).toFixed(0)}%</span>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Asset Coverage</span>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${healthColor}-500/10 border border-${healthColor}-500/20 text-${healthColor}-500 mb-2`}>
                                <ShieldCheck size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest italic">{healthStatus} Liquidity Health</span>
                            </div>
                            <h3 className="text-2xl font-black text-white italic tracking-tight">Financial Safeguard Audit</h3>
                            <p className="text-slate-500 text-xs leading-relaxed mt-2">
                                Your total liquid assets across <span className="text-indigo-400 font-bold">Paystack</span> and <span className="text-emerald-400 font-bold">VTPass</span> currently cover <span className="text-white font-bold">{((totalLiquidAssets / platformBalance) * 100).toFixed(1)}%</span> of all user wallet liabilities.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Assets</p>
                                <p className="text-xl font-black text-white">₦{totalLiquidAssets.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Operating Buffer</p>
                                <p className="text-xl font-black text-white text-indigo-400">₦{(operatingBuffer || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accuracy Metrics */}
                <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] space-y-10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            <span>Settlement Ratio</span>
                            <span className="text-white italic">98.2%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[98%] shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        </div>
                        <p className="text-[9px] text-slate-600 font-medium italic">Platform Accuracy Metric</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            <span>Escrow Velocity</span>
                            <span className="text-white italic">₦{((reservedPayouts || 0) * 0.4).toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[40%] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        </div>
                        <p className="text-[9px] text-slate-600 font-medium italic">Pending Payout Projections</p>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <a 
                            href="https://dashboard.paystack.com" 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-between w-full p-4 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 transition-all group"
                        >
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Paystack Console</span>
                            <ExternalLink size={14} className="text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminSystemWalletPage;
