import React, { useState, useEffect } from 'react';
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft, 
    RefreshCcw, 
    ShieldCheck, 
    Zap,
    Network,
    Plus,
    Clock,
    CheckCircle2
} from 'lucide-react';
import * as businessService from '../../../services/admin/businessService';
import { useBusinessStore } from '../store/businessStore';
import { CardSkeleton, ListSkeleton } from '../../../components/feedback/Skeletons';
import { toast } from 'react-toastify';

const BusinessWalletPage: React.FC = () => {
    const { summary, fetchSummary } = useBusinessStore();
    const [wallets, setWallets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWallets();
        fetchSummary();
    }, []);

    const loadWallets = async () => {
        setLoading(true);
        try {
            const data = await businessService.fetchBusinessWallet();
            setWallets(data.wallets || data || []);
        } catch (err) {
            toast.error("Failed to load provider balances");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Vault & Liquidity</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Monitor provider credits & system reserves</p>
                </div>
                <button 
                    onClick={loadWallets}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh Node
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
                ) : wallets.length === 0 ? (
                    <div className="col-span-full py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-4">
                        <Wallet size={40} className="text-slate-700" />
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">No provider wallets linked</p>
                    </div>
                ) : (
                    wallets.map((wallet: any, i: number) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6 hover:border-emerald-500/20 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl -mr-8 -mt-8 rounded-full"></div>
                            
                            <div className="flex items-center justify-between relative z-10">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-emerald-500">
                                    <Network size={24} />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                    Active Node
                                </span>
                            </div>

                            <div className="space-y-1 relative z-10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{wallet.providerName || 'Provider'}</p>
                                <h3 className="text-3xl font-bold text-white tracking-tighter">₦{(wallet.balance || 0).toLocaleString()}</h3>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-1.5 pt-1">
                                    <Clock size={12} />
                                    Last Sync: {wallet.lastSync || 'Just Now'}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">MTD Usage</p>
                                    <p className="text-sm font-bold text-slate-300">₦{(wallet.usage || 0).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Status</p>
                                    <p className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                                        <ShieldCheck size={14} />
                                        Stable
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">System Liquidity Index</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Aggregate platform reserves</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform Balance</p>
                        <p className="text-2xl font-bold text-white">₦{(summary.totalRevenue || 0).toLocaleString()}</p>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reserved Payouts</p>
                        <p className="text-2xl font-bold text-white">₦{(summary.totalExpenses || 0).toLocaleString()}</p>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Escrow Flow</p>
                        <p className="text-2xl font-bold text-white">₦{(summary.totalCost || 0).toLocaleString()}</p>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500" style={{ width: '25%' }}></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Net Profit Pulse</p>
                        <p className="text-2xl font-bold text-white">₦{(summary.netProfit || 0).toLocaleString()}</p>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessWalletPage;
