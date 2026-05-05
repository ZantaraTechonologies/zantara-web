import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Users, 
  Save, 
  RefreshCw, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import toast from 'react-hot-toast';

const AdminSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<any>({
        SITE_NAME: '',
        REFERRAL_RATE: 0,
        APP_LOCK_TIMEOUT_MINUTES: 3,
        TRANSFER_FEE_CONFIG: {
            type: 'tiered',
            increment: 500,
            feePerIncrement: 20,
            value: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/settings/business');
            if (res.data.success) {
                // Ensure TRANSFER_FEE_CONFIG is initialized
                const fetched = res.data.data;
                if (!fetched.TRANSFER_FEE_CONFIG) {
                    fetched.TRANSFER_FEE_CONFIG = { type: 'tiered', increment: 500, feePerIncrement: 20, value: 0 };
                }
                setSettings(fetched);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await apiClient.post('/admin/settings/business', settings);
            if (res.data.success) {
                toast.success("Settings saved successfully!");
                await loadSettings();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Business Settings
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Configure your platform's identity, security, and financial parameters.
                    </p>
                </div>
                <button 
                    onClick={loadSettings}
                    className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 transition-all border border-gray-700/50"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6 pb-12">
                {/* Site Identity Card */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm group hover:border-primary/30 transition-all duration-300">
                    <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Globe className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Site Identity</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Platform Name</label>
                            <input 
                                type="text" 
                                value={settings.SITE_NAME}
                                onChange={(e) => setSettings({ ...settings, SITE_NAME: e.target.value })}
                                placeholder="Enter your business name (e.g. Zantara)"
                                className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                This name appears in email footers, page titles, and receipts.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Referral & Growth Card */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm group hover:border-blue-500/30 transition-all duration-300">
                    <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Growth & Referrals</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Default Commission Rate (%)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                                <input 
                                    type="number" 
                                    step="0.001"
                                    value={settings.REFERRAL_RATE}
                                    onChange={(e) => setSettings({ ...settings, REFERRAL_RATE: Number(e.target.value) })}
                                    className="w-full bg-black/40 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="0.01"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500/50" />
                                Percentage of purchase profit earned by referrers on every transaction.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Wallet & Transfer Fees Card */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm group hover:border-orange-500/30 transition-all duration-300">
                    <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                            <Settings className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Wallet & Internal Transfers</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Fee Type</label>
                            <select 
                                value={settings.TRANSFER_FEE_CONFIG?.type || 'tiered'}
                                onChange={(e) => setSettings({ 
                                    ...settings, 
                                    TRANSFER_FEE_CONFIG: { ...settings.TRANSFER_FEE_CONFIG, type: e.target.value } 
                                })}
                                className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
                            >
                                <option value="tiered">Tiered (e.g. ₦20 per ₦500)</option>
                                <option value="flat">Flat Fee (Fixed amount)</option>
                                <option value="percentage">Percentage (%)</option>
                            </select>
                        </div>

                        {settings.TRANSFER_FEE_CONFIG?.type === 'tiered' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Increment (₦)</label>
                                    <input 
                                        type="number" 
                                        value={settings.TRANSFER_FEE_CONFIG?.increment}
                                        onChange={(e) => setSettings({ 
                                            ...settings, 
                                            TRANSFER_FEE_CONFIG: { ...settings.TRANSFER_FEE_CONFIG, increment: Number(e.target.value) } 
                                        })}
                                        className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Fee per Increment (₦)</label>
                                    <input 
                                        type="number" 
                                        value={settings.TRANSFER_FEE_CONFIG?.feePerIncrement}
                                        onChange={(e) => setSettings({ 
                                            ...settings, 
                                            TRANSFER_FEE_CONFIG: { ...settings.TRANSFER_FEE_CONFIG, feePerIncrement: Number(e.target.value) } 
                                        })}
                                        className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {(settings.TRANSFER_FEE_CONFIG?.type === 'flat' || settings.TRANSFER_FEE_CONFIG?.type === 'percentage') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {settings.TRANSFER_FEE_CONFIG?.type === 'flat' ? 'Flat Fee (₦)' : 'Fee Percentage (%)'}
                                </label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={settings.TRANSFER_FEE_CONFIG?.value}
                                    onChange={(e) => setSettings({ 
                                        ...settings, 
                                        TRANSFER_FEE_CONFIG: { ...settings.TRANSFER_FEE_CONFIG, value: Number(e.target.value) } 
                                    })}
                                    className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile App Security Card */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm group hover:border-teal-500/30 transition-all duration-300">
                    <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
                            <Settings className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Mobile App Security</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">App Lock Timeout (Minutes)</label>
                            <input 
                                type="number" 
                                min="1"
                                value={settings.APP_LOCK_TIMEOUT_MINUTES}
                                onChange={(e) => setSettings({ ...settings, APP_LOCK_TIMEOUT_MINUTES: parseInt(e.target.value) || 3 })}
                                className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end pt-4">
                    <button 
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20"
                    >
                        {saving ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {saving ? "Saving Changes..." : "Save Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsPage;
