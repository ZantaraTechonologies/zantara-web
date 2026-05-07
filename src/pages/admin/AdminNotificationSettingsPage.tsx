import React, { useState, useEffect } from 'react';
import {
    Bell,
    MessageSquare,
    Mail,
    Save,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
    ShieldCheck,
    KeyRound,
    LogIn,
    Wallet,
    Megaphone,
} from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import toast from 'react-hot-toast';

interface NotificationSettings {
    sms: {
        phone_verification: boolean;
        password_reset: boolean;
        change_pin: boolean;
        change_password: boolean;
        email_verification: boolean;
        withdrawal_approved: boolean;
        critical_system: boolean;
    };
    email: {
        phone_verification: boolean;
        password_reset: boolean;
        email_verification: boolean;
        withdrawal_approved: boolean;
        critical_system: boolean;
    };
}

const defaultSettings: NotificationSettings = {
    sms: {
        phone_verification: true,
        password_reset: true,
        change_pin: true,
        change_password: true,
        email_verification: true,
        withdrawal_approved: true,
        critical_system: true,
    },
    email: {
        phone_verification: true,
        password_reset: true,
        email_verification: true,
        withdrawal_approved: true,
        critical_system: true,
    },
};

interface ToggleRowProps {
    label: string;
    description: string;
    icon: React.ElementType;
    value: boolean;
    onChange: (val: boolean) => void;
    accentColor: string;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, icon: Icon, value, onChange, accentColor }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-800 last:border-0">
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${accentColor} shrink-0`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
        </div>
        <button
            type="button"
            onClick={() => onChange(!value)}
            className="flex items-center gap-2 shrink-0 ml-4"
            aria-label={`Toggle ${label}`}
        >
            {value ? (
                <ToggleRight className="w-8 h-8 text-emerald-500 transition-all" />
            ) : (
                <ToggleLeft className="w-8 h-8 text-gray-600 transition-all" />
            )}
            <span className={`text-xs font-bold w-6 ${value ? 'text-emerald-400' : 'text-gray-500'}`}>
                {value ? 'ON' : 'OFF'}
            </span>
        </button>
    </div>
);

const AdminNotificationSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/settings/notifications');
            if (res.data.success) {
                // Deep-merge with defaults to handle any missing keys
                setSettings({
                    sms: { ...defaultSettings.sms, ...(res.data.data?.sms || {}) },
                    email: { ...defaultSettings.email, ...(res.data.data?.email || {}) },
                });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to load notification settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await apiClient.post('/admin/settings/notifications', settings);
            if (res.data.success) {
                toast.success('Notification settings saved!');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const setSms = (key: keyof NotificationSettings['sms'], val: boolean) => {
        setSettings(prev => ({ ...prev, sms: { ...prev.sms, [key]: val } }));
    };

    const setEmail = (key: keyof NotificationSettings['email'], val: boolean) => {
        setSettings(prev => ({ ...prev, email: { ...prev.email, [key]: val } }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Notification Settings
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Control which SMS and email notifications are sent to users for each activity.
                    </p>
                </div>
                <button
                    onClick={loadSettings}
                    className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 transition-all border border-gray-700/50"
                    title="Refresh"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SMS Settings Card */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300">
                    <div className="p-5 border-b border-gray-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">SMS Notifications</h2>
                            <p className="text-xs text-gray-500">Sent via Termii to the user's phone</p>
                        </div>
                    </div>
                    <div className="p-5">
                        <ToggleRow
                            label="Phone Verification OTP"
                            description="OTP sent during registration or phone verification"
                            icon={ShieldCheck}
                            value={settings.sms.phone_verification}
                            onChange={(v) => setSms('phone_verification', v)}
                            accentColor="bg-blue-500/10 text-blue-400"
                        />
                        <ToggleRow
                            label="Password Reset OTP"
                            description="OTP sent when a user requests a forgotten password reset"
                            icon={KeyRound}
                            value={settings.sms.password_reset}
                            onChange={(v) => setSms('password_reset', v)}
                            accentColor="bg-orange-500/10 text-orange-400"
                        />
                        <ToggleRow
                            label="Change PIN Verification"
                            description="OTP sent before a user changes or resets their transaction PIN"
                            icon={LogIn}
                            value={settings.sms.change_pin}
                            onChange={(v) => setSms('change_pin', v)}
                            accentColor="bg-purple-500/10 text-purple-400"
                        />
                        <ToggleRow
                            label="Change Password Verification"
                            description="OTP sent before a logged-in user changes their password"
                            icon={ShieldCheck}
                            value={settings.sms.change_password}
                            onChange={(v) => setSms('change_password', v)}
                            accentColor="bg-red-500/10 text-red-400"
                        />
                        <ToggleRow
                            label="Email Verification Fallback"
                            description="SMS sent alongside email when a user verifies their email address"
                            icon={Mail}
                            value={settings.sms.email_verification}
                            onChange={(v) => setSms('email_verification', v)}
                            accentColor="bg-emerald-500/10 text-emerald-400"
                        />
                        <ToggleRow
                            label="Withdrawal Approved/Rejected Fallback"
                            description="SMS sent alongside email when admin processes a withdrawal request"
                            icon={Wallet}
                            value={settings.sms.withdrawal_approved}
                            onChange={(v) => setSms('withdrawal_approved', v)}
                            accentColor="bg-yellow-500/10 text-yellow-400"
                        />
                        <ToggleRow
                            label="Critical System Broadcasts Fallback"
                            description="SMS sent to all users when admin sends a critical broadcast"
                            icon={Megaphone}
                            value={settings.sms.critical_system}
                            onChange={(v) => setSms('critical_system', v)}
                            accentColor="bg-red-500/10 text-red-400"
                        />
                    </div>
                </div>

                {/* Email Settings Card */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
                    <div className="p-5 border-b border-gray-800 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Email Notifications</h2>
                            <p className="text-xs text-gray-500">Sent via SMTP to the user's email address</p>
                        </div>
                    </div>
                    <div className="p-5">
                        <ToggleRow
                            label="Phone Verification Fallback"
                            description="Email sent alongside SMS during phone verification"
                            icon={ShieldCheck}
                            value={settings.email.phone_verification}
                            onChange={(v) => setEmail('phone_verification', v)}
                            accentColor="bg-blue-500/10 text-blue-400"
                        />
                        <ToggleRow
                            label="Password Reset Fallback"
                            description="Email sent alongside SMS when a user resets their password"
                            icon={KeyRound}
                            value={settings.email.password_reset}
                            onChange={(v) => setEmail('password_reset', v)}
                            accentColor="bg-orange-500/10 text-orange-400"
                        />
                        <ToggleRow
                            label="Email Verification OTP"
                            description="OTP sent when a user verifies their email address"
                            icon={Mail}
                            value={settings.email.email_verification}
                            onChange={(v) => setEmail('email_verification', v)}
                            accentColor="bg-emerald-500/10 text-emerald-400"
                        />
                        <ToggleRow
                            label="Withdrawal Approved/Rejected"
                            description="Email sent when admin processes a user's withdrawal request"
                            icon={Wallet}
                            value={settings.email.withdrawal_approved}
                            onChange={(v) => setEmail('withdrawal_approved', v)}
                            accentColor="bg-yellow-500/10 text-yellow-400"
                        />
                        <ToggleRow
                            label="Critical System Broadcasts"
                            description="Email sent to all users when admin sends a critical broadcast"
                            icon={Megaphone}
                            value={settings.email.critical_system}
                            onChange={(v) => setEmail('critical_system', v)}
                            accentColor="bg-red-500/10 text-red-400"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Banner */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 flex flex-wrap gap-4 items-center">
                <Bell className="w-5 h-5 text-gray-500 shrink-0" />
                <p className="text-sm text-gray-400 flex-1">
                    Disabling a channel does <span className="font-bold text-white">not</span> remove in-app or push notifications — those are always delivered. Only the external SMS/email dispatch is blocked.
                </p>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-emerald-500/20"
                >
                    {saving ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default AdminNotificationSettingsPage;
