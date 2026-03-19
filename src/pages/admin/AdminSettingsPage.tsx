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
    Cpu,
    Database,
    CloudIcon
} from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import { CardSkeleton } from '../../components/feedback/Skeletons';
import { toast } from 'react-toastify';

const AdminSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<any>(null);
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
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-emerald-500">
                            <Cpu size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Platform Core</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global system thresholds</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Maintenance Mode</label>
                            <div className="flex items-center gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                                    className={`w-14 h-8 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                                </button>
                                <span className="text-xs font-bold text-slate-400">{settings.maintenanceMode ? 'Active / restricted access' : 'Inactive / open access'}</span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Minimum Withdrawal (₦)</label>
                            <input 
                                type="number" 
                                value={settings.minWithdrawal}
                                onChange={(e) => setSettings({...settings, minWithdrawal: Number(e.target.value)})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Referral Bonus Rate (%)</label>
                            <input 
                                type="number" 
                                value={settings.referralRate}
                                onChange={(e) => setSettings({...settings, referralRate: Number(e.target.value)})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-blue-500">
                            <CloudIcon size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">VTU Gateway</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Provider node configuration</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Gateway</span>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Verified</span>
                            </div>
                            <select 
                                value={settings.primaryGateway}
                                onChange={(e) => setSettings({...settings, primaryGateway: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold outline-none"
                            >
                                <option value="vtpass">VTpass (Direct)</option>
                                <option value="monnify">Monnify Service</option>
                                <option value="simhost">Simhost Gateway</option>
                            </select>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gateway Timeout (ms)</label>
                            <input 
                                type="number" 
                                value={settings.gatewayTimeout || 30000}
                                onChange={(e) => setSettings({...settings, gatewayTimeout: Number(e.target.value)})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AdminSettingsPage;
