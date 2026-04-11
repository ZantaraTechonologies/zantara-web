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
    ShieldAlert,
    PieChart,
    Banknote,
    Lock,
    Settings,
    Gem
} from 'lucide-react';
import { 
    getCommissionSettings, 
    updateCommissionSettings, 
    getAgentSettings, 
    updateAgentSettings,
    getCommissionCaps,
    updateCommissionCaps,
    getSystemSettings,
    updateSystemSettings
} from '../../../services/admin/adminBusinessService';
import { useWalletStore } from '../../../store/wallet/walletStore';
import { toast } from 'react-hot-toast';

const AdminCommissionSettingsPage: React.FC = () => {
    const { currency } = useWalletStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    
    // Settings state
    const [commSettings, setCommSettings] = useState<any>({ defaultCommissionRate: 0.01 });
    const [agentSettings, setAgentSettings] = useState<any>({ defaultAgentDiscountRate: 0.0 });
    const [capSettings, setCapSettings] = useState<any>({ 
        maxReferralProfitShare: 0.9,
        maxAgentReferralShare: 0.5 
    });
    const [systemSettings, setSystemSettings] = useState<any>(null);

    // Preview Calculator State
    const [previewProfit, setPreviewProfit] = useState(1000);

    const loadAllSettings = async () => {
        try {
            setLoading(true);
            const [comm, agent, caps, system] = await Promise.all([
                getCommissionSettings(),
                getAgentSettings(),
                getCommissionCaps(),
                getSystemSettings()
            ]);
            
            if (comm?.success && typeof comm.defaultCommissionRate === 'number') {
                setCommSettings({ defaultCommissionRate: comm.defaultCommissionRate });
            }
            if (agent?.success && typeof agent.defaultAgentDiscountRate === 'number') {
                setAgentSettings({ defaultAgentDiscountRate: agent.defaultAgentDiscountRate });
            }
            if (caps?.success) {
                setCapSettings({
                    maxReferralProfitShare: caps.maxReferralProfitShare ?? 0.9,
                    maxAgentReferralShare: caps.maxAgentReferralShare ?? 0.5
                });
            }
            if (system?.data) {
                setSystemSettings(system.data);
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
            const rate = commSettings.defaultCommissionRate;
            if (rate < 0 || rate > 0.1) {
                toast.error("Rate must be between 0% and 10%");
                return;
            }
            const res = await updateCommissionSettings(commSettings);
            if (res.success) toast.success("Global commission rate synchronized");
            else toast.error(res.message || "Update failed");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err.message || "Update failed");
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

    const handleSaveInvestment = async () => {
        try {
            setSaving('invest');
            if (!systemSettings) return;

            // Backend /admin/settings only accepts one { key, value } at a time
            const investmentKeys = [
                'sharePrice',
                'investorAllocationPercent',
                'totalSharesAvailable',
                'maxSharesPerUser',
                'minSharesPerPurchase',
                'dividendWithdrawalFee',
                'investmentEnabled',
            ];

            const promises = investmentKeys.map((k) =>
                systemSettings[k] !== undefined
                    ? updateSystemSettings({ key: k, value: systemSettings[k] })
                    : Promise.resolve()
            );

            await Promise.all(promises);
            toast.success("Investment protocols synchronized");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err.message || "Failed to update investment parameters");
        } finally {
            setSaving(null);
        }
    };

    // Calculation Helpers for Preview
    const calcReferral = previewProfit * commSettings.defaultCommissionRate;
    const cappedReferral = Math.min(calcReferral, previewProfit * capSettings.maxReferralProfitShare);
    
    const calcAgent = previewProfit * agentSettings.defaultAgentDiscountRate;
    const cappedAgent = Math.min(calcAgent, previewProfit * capSettings.maxAgentReferralShare);

    const platformNet = previewProfit - cappedReferral - cappedAgent;

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Configuring Financial Subsystems...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic">Financial Protocol Hub</h1>
                    <p className="text-slate-500 text-[10px] font-black tracking-[0.3em] mt-1 uppercase">Unified Business Model & Equity Governance</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={loadAllSettings}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all hover:bg-white/10 shadow-xl"
                    >
                        <RefreshCcw size={20} />
                    </button>
                </div>
            </div>

            {/* --- EQUITY & INVESTMENT PROTOCOLS --- */}
            <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-7 space-y-7 relative overflow-hidden group">
                <div className="absolute top-[-50px] right-[-50px] opacity-[0.03] text-indigo-500 transition-transform group-hover:scale-110 duration-[2s]">
                    <Gem size={350} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-[1.2rem] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-xl shadow-indigo-500/5">
                            <PieChart size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight italic">Equity & Shareholder Governance</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Global capital rules & dividend distribution</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-950/50 px-6 py-4 rounded-3xl border border-white/5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Investment System</label>
                        <button 
                            type="button"
                            onClick={() => setSystemSettings({...systemSettings, investmentEnabled: !systemSettings?.investmentEnabled})}
                            className={`w-14 h-7 rounded-full transition-all relative ${systemSettings?.investmentEnabled ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${systemSettings?.investmentEnabled ? 'left-8' : 'left-1'}`} />
                        </button>
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter w-12">{systemSettings?.investmentEnabled ? 'ON' : 'OFF'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Share Valuation ({currency})</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={systemSettings?.sharePrice || 0}
                                onChange={(e) => setSystemSettings({...systemSettings, sharePrice: Number(e.target.value)})}
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-lg text-white focus:outline-none focus:border-indigo-500/50 transition-all font-black tabular-nums"
                            />
                        </div>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Unit cost for 1.0 equity share.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Investor Allocation (%)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={systemSettings?.investorAllocationPercent || 0}
                                onChange={(e) => setSystemSettings({...systemSettings, investorAllocationPercent: Number(e.target.value)})}
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-lg text-white focus:outline-none focus:border-indigo-500/50 transition-all font-black tabular-nums"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-black">%</div>
                        </div>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Share of Monthly Net profits.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Shares Cap</label>
                        <input 
                            type="number" 
                            value={systemSettings?.totalSharesAvailable || 0}
                            onChange={(e) => setSystemSettings({...systemSettings, totalSharesAvailable: Number(e.target.value)})}
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-lg text-white focus:outline-none focus:border-indigo-500/50 transition-all font-black tabular-nums"
                        />
                         <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Total units for circulation.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Div. Withdrawal Fee (%)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={systemSettings?.dividendWithdrawalFee || 0}
                                onChange={(e) => setSystemSettings({...systemSettings, dividendWithdrawalFee: Number(e.target.value)})}
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-lg text-white focus:outline-none focus:border-indigo-500/50 transition-all font-black tabular-nums"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-black">%</div>
                        </div>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Platform service fee on payouts.</p>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button 
                        onClick={handleSaveInvestment}
                        disabled={saving === 'invest'}
                        className="px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.25em] hover:bg-indigo-500 transition-all flex items-center gap-3 shadow-2xl shadow-indigo-600/20 disabled:opacity-50"
                    >
                        {saving === 'invest' ? <Loader2 className="animate-spin" size={20} /> : <><Lock size={20} /> Commit Equity Protocol</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- REFERRAL PROTOCOL --- */}
                <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-7 space-y-7 relative overflow-hidden group">
                    <div className="absolute top-[-20px] right-[-20px] opacity-[0.03] text-emerald-500 transition-transform group-hover:scale-110 duration-[2s]">
                        <Users size={250} />
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-xl shadow-emerald-500/5">
                                <Zap size={22} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight italic">Referral Distribution</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Partner profit-share default</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <label>Margin Share Default (%)</label>
                                <span className="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">Active</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="number"
                                    step="0.001"
                                    value={Number(((commSettings?.defaultCommissionRate ?? 0) * 100).toFixed(3))}
                                    onChange={(e) => setCommSettings({ ...commSettings, defaultCommissionRate: Number(e.target.value) / 100 })}
                                    className="w-full h-16 bg-slate-950 border border-white/10 rounded-2xl px-6 text-xl text-white font-black outline-none focus:border-emerald-500/50 transition-all"
                                    placeholder="1.0"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">% of Profit</div>
                            </div>
                            <p className="text-[10px] text-slate-600 font-bold leading-relaxed italic">
                                * Percentage of the NET PROFIT credited to referrers per transaction.
                            </p>
                        </div>

                        <button 
                            onClick={handleSaveCommission}
                            disabled={saving === 'comm'}
                            className="w-full h-16 bg-emerald-500 text-slate-950 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/10"
                        >
                            {saving === 'comm' ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={20} /> Synchronized Referral Node</>}
                        </button>
                    </div>
                </div>

                {/* --- AGENT PROTOCOL --- */}
                <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-7 space-y-7 relative overflow-hidden group">
                    <div className="absolute top-[-20px] right-[-20px] opacity-[0.03] text-blue-500 transition-transform group-hover:scale-110 duration-[2s]">
                        <TrendingUp size={250} />
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 shadow-xl shadow-blue-500/5">
                                <TrendingUp size={22} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight italic">Reseller Whitelisting</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Wholesale pricing protocol</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <label>Agent Discount Rate (%)</label>
                                <span className="text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">Wholesale</span>
                            </div>
                            <div className="relative">
                                <input 
                                    type="number"
                                    step="0.1"
                                    value={Number(((agentSettings?.defaultAgentDiscountRate ?? 0) * 100).toFixed(2))}
                                    onChange={(e) => setAgentSettings({ ...agentSettings, defaultAgentDiscountRate: Number(e.target.value) / 100 })}
                                    className="w-full h-16 bg-slate-950 border border-white/10 rounded-2xl px-6 text-xl text-white font-black outline-none focus:border-blue-500/50 transition-all"
                                    placeholder="0.0"
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">% of Profit</div>
                            </div>
                            <p className="text-[10px] text-slate-600 font-bold leading-relaxed italic">
                                * Agents receive this percentage of the profit margin as a direct price reduction.
                            </p>
                        </div>

                        <button 
                            onClick={handleSaveAgent}
                            disabled={saving === 'agent'}
                            className="w-full h-16 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all hover:text-blue-600 flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/10"
                        >
                            {saving === 'agent' ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Activate Pricing Protocol</>}
                        </button>
                    </div>
                </div>

                {/* --- INTEGRITY CAPS --- */}
                <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-7 space-y-7 relative overflow-hidden group shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/10">
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-xl shadow-rose-500/5">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight italic text-rose-500">Platform Guardrails</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Anti-loss security thresholds</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] ml-1">
                                    <AlertTriangle size={14} />
                                    <span>Max Referral Cap</span>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={Number(((capSettings?.maxReferralProfitShare ?? 0.9) * 100).toFixed(2))}
                                        onChange={(e) => setCapSettings({...capSettings, maxReferralProfitShare: Number(e.target.value) / 100})}
                                        className="w-full h-16 bg-slate-950 border border-white/10 rounded-2xl px-6 text-xl text-white font-black outline-none focus:border-rose-500/50 transition-all font-mono"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-black">%</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] ml-1">
                                    <AlertTriangle size={14} />
                                    <span>Max Agent Cap</span>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={Number(((capSettings?.maxAgentReferralShare ?? 0.5) * 100).toFixed(2))}
                                        onChange={(e) => setCapSettings({...capSettings, maxAgentReferralShare: Number(e.target.value) / 100})}
                                        className="w-full h-16 bg-slate-950 border border-white/10 rounded-2xl px-6 text-xl text-white font-black outline-none focus:border-rose-500/50 transition-all font-mono"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-black">%</div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveCaps}
                            disabled={saving === 'caps'}
                            className="mt-8 w-full h-14 bg-rose-600/10 border border-rose-600/30 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-4 group shadow-xl"
                        >
                            {saving === 'caps' ? <Loader2 className="animate-spin" size={24} /> : <><ShieldCheck size={24} className="group-hover:scale-110 transition-transform"/> Lock Safety protocols</>}
                        </button>
                    </div>
                </div>

                {/* --- SIMULATOR --- */}
                <div className="bg-slate-950 border border-white/5 rounded-[2rem] p-7 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-5 justify-between pb-5 border-b border-white/5 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight italic">Yield Simulator</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Real-time Transaction Modeling</p>
                            </div>
                        </div>
                        <div className="text-4xl font-black text-white tabular-nums italic tracking-tighter drop-shadow-lg">₦{previewProfit.toLocaleString()}</div>
                    </div>

                    <div className="space-y-8 flex-1 flex flex-col justify-center">
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Hypothetical Profit Margin</label>
                            </div>
                            <input 
                                type="range" 
                                min="100" 
                                max="10000" 
                                step="100"
                                value={previewProfit}
                                onChange={(e) => setPreviewProfit(Number(e.target.value))}
                                className="w-full h-2 bg-slate-900 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                            />
                        </div>

                        <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-white/5 space-y-6 shadow-inner">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Platform Net retained</span>
                                    <span className="text-white">₦{platformNet.toFixed(2)}</span>
                                </div>
                                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-px">
                                    <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${(platformNet / previewProfit) * 100}%` }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-5 border-t border-white/5">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                                        <span>Referral Payout</span>
                                        <span className="text-emerald-400 font-bold italic">₦{cappedReferral.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-px">
                                        <div className="bg-emerald-500/30 h-full transition-all duration-1000 rounded-full" style={{ width: `${(cappedReferral / previewProfit) * 100}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                                        <span>Agent Discount</span>
                                        <span className="text-blue-400 font-bold italic">₦{cappedAgent.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-px">
                                        <div className="bg-blue-500/30 h-full transition-all duration-1000 rounded-full" style={{ width: `${(cappedAgent / previewProfit) * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Note Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-start gap-4 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-indigo-500">
                    <Info size={100} />
                </div>
                <div className="p-3 bg-slate-800 rounded-xl text-slate-400 shrink-0 shadow-lg shadow-black/20">
                    <Info size={20} />
                </div>
                <div className="relative z-10">
                    <h4 className="text-lg font-black text-white mb-2 tracking-tight italic">Architecture Override Note</h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-4xl uppercase tracking-tighter opacity-80">
                        The parameters defined here act as the global baseline for the entire ecosystem. Individual user overrides (Referral rates or Agent tiers) explicitly configured in the User Detail section will take precedence. All commission and discount math is applied strictly to the <span className="text-emerald-500">MARKUP PROFIT</span> derived from the cost-ledger.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminCommissionSettingsPage;
