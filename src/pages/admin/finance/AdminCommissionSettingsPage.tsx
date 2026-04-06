import React, { useState, useEffect } from 'react';
import { 
    BadgePercent, 
    ShieldCheck, 
    Save, 
    RefreshCcw, 
    Users, 
    Info, 
    TrendingUp,
    Zap,
    Loader2,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';
import { 
    getCommissionSettings, 
    updateCommissionSettings, 
    getAgentSettings, 
    updateAgentSettings,
    getCommissionCaps,
    updateCommissionCaps
} from '../../../services/admin/adminBusinessService';
import { toast } from 'react-hot-toast';

const AdminCommissionSettingsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    
    // Settings state
    const [commSettings, setCommSettings] = useState<any>({ defaultCommissionRate: 0.01 });
    const [agentSettings, setAgentSettings] = useState<any>({ defaultAgentDiscountRate: 0.02 });
    const [capSettings, setCapSettings] = useState<any>({ 
        referralCommissionProfitCap: 0.3,
        agentDiscountProfitCap: 0.5 
    });

    const loadAllSettings = async () => {
        try {
            setLoading(true);
            const [comm, agent, caps] = await Promise.all([
                getCommissionSettings(),
                getAgentSettings(),
                getCommissionCaps()
            ]);
            
            if (comm?.success && typeof comm.defaultCommissionRate === 'number') {
                setCommSettings({ defaultCommissionRate: comm.defaultCommissionRate });
            }
            if (agent?.success && typeof agent.defaultAgentDiscountRate === 'number') {
                setAgentSettings({ defaultAgentDiscountRate: agent.defaultAgentDiscountRate });
            }
            if (caps?.success) {
                const data = caps.data || caps; // Handle both {data: {}} or top-level 
                if (data.referralCommissionProfitCap !== undefined) {
                    setCapSettings(data);
                }
            }
            
        } catch (err: any) {
            toast.error(err.message || "Failed to load financial parameters");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllSettings();
    }, []);

    const handleSaveCommission = async () => {
        try {
            setSaving('comm');
            const res = await updateCommissionSettings(commSettings);
            if (res.success) toast.success("Global commission rate synchronized");
        } catch (err: any) {
            toast.error(err.message || "Update failed");
        } finally {
            setSaving(null);
        }
    };

    const handleSaveAgent = async () => {
        try {
            setSaving('agent');
            const res = await updateAgentSettings(agentSettings);
            if (res.success) toast.success("Agent discount protocol updated");
        } catch (err: any) {
            toast.error(err.message || "Update failed");
        } finally {
            setSaving(null);
        }
    };

    const handleSaveCaps = async () => {
        try {
            setSaving('caps');
            const res = await updateCommissionCaps(capSettings);
            if (res.success) toast.success("Integrity caps locked successfully");
        } catch (err: any) {
            toast.error(err.message || "Update failed");
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Encrypting Financial Nodes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Commission & Discounts</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Financial Protocol Management</p>
                </div>
                <button 
                    onClick={loadAllSettings}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all hover:bg-white/10"
                >
                    <RefreshCcw size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Global Commission Section */}
                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-[-20px] right-[-20px] opacity-5 text-emerald-500 transition-transform group-hover:scale-110 duration-700">
                        <BadgePercent size={200} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/5">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Referral Commission</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global profit-share default</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <label>Default Rate (%)</label>
                                    <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Enabled</span>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        step="0.001"
                                        value={(commSettings?.defaultCommissionRate ?? 0) * 100}
                                        onChange={(e) => setCommSettings({ ...commSettings, defaultCommissionRate: Number(e.target.value) / 100 })}
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-lg text-white font-black outline-none focus:border-emerald-500/50 transition-all"
                                        placeholder="20.0"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</div>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                    * This percentage of the PROFIT MARGIN will be credited to referrers. Recommended: 10% - 30%.
                                </p>
                            </div>

                            <button 
                                onClick={handleSaveCommission}
                                disabled={saving === 'comm'}
                                className="w-full h-14 bg-emerald-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10"
                            >
                                {saving === 'comm' ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Synchronize Rate</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Agent Discount Section */}
                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-[-20px] right-[-20px] opacity-5 text-blue-500 transition-transform group-hover:scale-110 duration-700">
                        <Users size={200} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 shadow-lg shadow-blue-500/5">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Agent Discount Protocol</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Reseller wholesale pricing</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <label>Agent Discount (%)</label>
                                    <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Wholesale</span>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        step="0.1"
                                        value={(agentSettings?.defaultAgentDiscountRate ?? 0) * 100}
                                        onChange={(e) => setAgentSettings({ ...agentSettings, defaultAgentDiscountRate: Number(e.target.value) / 100 })}
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-lg text-white font-black outline-none focus:border-blue-500/50 transition-all"
                                        placeholder="50.0"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</div>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                    * Agents receive this percentage of the PROFIT MARGIN as a discount. (e.g., 50% shares margin evenly).
                                </p>
                            </div>

                            <button 
                                onClick={handleSaveAgent}
                                disabled={saving === 'agent'}
                                className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/10"
                            >
                                {saving === 'agent' ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update Pricing Mode</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Integrity Caps Section */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-[-50px] right-[50%] translate-x-1/2 opacity-5 text-rose-500 transition-transform group-hover:rotate-12 duration-[2s]">
                        <ShieldAlert size={400} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/5">
                            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Security & Margin Integrity</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Fail-safe protocol to protect equity capital</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                        <AlertTriangle size={12} />
                                        <span>Max Referral Payout Cap</span>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            step="0.01"
                                            value={(capSettings?.referralCommissionProfitCap ?? 0.3) * 100}
                                            onChange={(e) => setCapSettings({...capSettings, referralCommissionProfitCap: Number(e.target.value) / 100})}
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-lg text-white font-black outline-none focus:border-rose-500/50 transition-all"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">% of Profit</div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                        Limits commissions such that they never consume more than <b>{(capSettings?.referralCommissionProfitCap ?? 0.3) * 100}%</b> of the profit made from a transaction. 
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                        <AlertTriangle size={12} />
                                        <span>Max Agent Discount Cap</span>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            step="0.01"
                                            value={(capSettings?.agentDiscountProfitCap ?? 0.5) * 100}
                                            onChange={(e) => setCapSettings({...capSettings, agentDiscountProfitCap: Number(e.target.value) / 100})}
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-lg text-white font-black outline-none focus:border-rose-500/50 transition-all"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">% of Profit</div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                        Ensures that agent discounts never exceed <b>{(capSettings?.agentDiscountProfitCap ?? 0.5) * 100}%</b> of the available markup profit.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveCaps}
                            disabled={saving === 'caps'}
                            className="mt-12 w-full h-16 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-3 group"
                        >
                            {saving === 'caps' ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={20} className="group-hover:scale-110 transition-transform"/> Lock Margin Protocols</>}
                        </button>
                    </div>
                </div>

                {/* Note Card */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-start gap-4">
                    <div className="p-3 bg-slate-800 rounded-xl text-slate-400 shrink-0">
                        <Info size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white mb-1">Architecture Note</h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            Changes made here will take effect immediately for all new transactions. These global settings act as the fallback; individual user overrides defined in the User Management section will always take precedence over these system defaults. Commission logic uses the "v2-dynamic-integrity" version by default.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCommissionSettingsPage;
