import React, { useState, useEffect } from 'react';
import { 
    Settings, 
    Save, 
    RefreshCcw, 
    Shield, 
    Zap,
    Network,
    Bell,
    Lock,
    Database,
    CloudIcon,
    PieChart,
    BarChart3,
    Cpu
} from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import { CardSkeleton } from '../../components/feedback/Skeletons';
import { useWalletStore } from '../../store/wallet/walletStore';
import { toast } from 'react-hot-toast';

const AdminSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<any>(null);
    const { currency } = useWalletStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/settings');
            setSettings(res.data);
        } catch (err) {
            toast.error("Failed to load system settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiClient.post('/admin/settings', settings);
            toast.success("Settings synchronized across all nodes");
        } catch (err) {
            toast.error("Failed to update system parameters");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><CardSkeleton /><CardSkeleton /></div>;

    return (
        <form onSubmit={handleSave} className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Parameters</h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest mt-1 uppercase">Infrastructure & Service configuration</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={loadSettings}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"
                    >
                        <RefreshCcw size={18} />
                    </button>
                    <button 
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 rounded-2xl text-[10px] font-bold text-slate-950 uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-50"
                    >
                        <Save size={16} />
                        {saving ? "Syncing..." : "Commit Changes"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-emerald-500">
                                <Cpu size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Platform Core</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global system thresholds</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maintenance</label>
                            <button 
                                type="button"
                                onClick={() => setSettings({...settings, maintenanceMode: !settings?.maintenanceMode})}
                                className={`w-12 h-6 rounded-full transition-all relative ${settings?.maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.maintenanceMode ? 'left-7' : 'left-1'}`} />
                            </button>
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{settings?.maintenanceMode ? 'LOCKED' : 'OPEN'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Minimum Withdrawal ({currency})</label>
                            <input 
                                type="number" 
                                value={settings?.minWithdrawal || 0}
                                onChange={(e) => setSettings({...settings, minWithdrawal: Number(e.target.value)})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Referral Bonus Rate (%)</label>
                            <input 
                                type="number" 
                                value={settings?.referralRate || 0}
                                onChange={(e) => setSettings({...settings, referralRate: Number(e.target.value)})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8 lg:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-amber-500">
                                <PieChart size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Investment & Shareholder Controls</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global equity and dividend governance</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status</label>
                            <button 
                                type="button"
                                onClick={() => setSettings({...settings, investmentEnabled: !settings?.investmentEnabled})}
                                className={`w-12 h-6 rounded-full transition-all relative ${settings?.investmentEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.investmentEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{settings?.investmentEnabled ? 'ENABLED' : 'DISABLED'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {/* Column 1: Financials */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Share Price ({currency})</label>
                                <input 
                                    type="number" 
                                    value={settings?.sharePrice || 10000}
                                    onChange={(e) => setSettings({...settings, sharePrice: Number(e.target.value)})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Investor Allocation (%)</label>
                                <input 
                                    type="number" 
                                    value={settings.investorAllocationPercent || 20}
                                    onChange={(e) => setSettings({...settings, investorAllocationPercent: Number(e.target.value)})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                />
                                <p className="text-[9px] text-slate-500 font-medium italic mt-1">% of monthly net profit shared.</p>
                            </div>
                        </div>

                        {/* Column 2: Inventory & Limits */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Shares Cap</label>
                                <input 
                                    type="number" 
                                    value={settings.totalSharesAvailable || 200}
                                    onChange={(e) => setSettings({...settings, totalSharesAvailable: Number(e.target.value)})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Shares Per User</label>
                                <input 
                                    type="number" 
                                    value={settings.maxSharesPerUser || 20}
                                    onChange={(e) => setSettings({...settings, maxSharesPerUser: Number(e.target.value)})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                />
                            </div>
                        </div>

                        {/* Column 3: Rules & Fees */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Min Shares Per Purchase</label>
                                <input 
                                    type="number" 
                                    value={settings.minSharesPerPurchase || 1}
                                    onChange={(e) => setSettings({...settings, minSharesPerPurchase: Number(e.target.value)})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Withdrawal Fee (%)</label>
                                <input 
                                    type="number" 
                                    value={settings.dividendWithdrawalFee || 1.5}
                                    onChange={(e) => setSettings({...settings, dividendWithdrawalFee: Number(e.target.value)})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </form>
    );
};

export default AdminSettingsPage;
