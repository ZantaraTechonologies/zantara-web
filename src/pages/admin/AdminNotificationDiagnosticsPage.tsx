import React, { useState, useEffect } from 'react';
import {
    Activity,
    ShieldCheck,
    Mail,
    MessageSquare,
    Bell,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Send,
    Eye,
    EyeOff,
    Database
} from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import toast from 'react-hot-toast';

interface DiagnosticData {
    push: { provider: string; host: string };
    email: { user: string; pass: string; host: string };
    sms: { provider: string; apiKey: string; senderId: string };
    database: { totalUsers: number; usersWithPushTokens: number };
    env: string;
}

const AdminNotificationDiagnosticsPage: React.FC = () => {
    const [data, setData] = useState<DiagnosticData | null>(null);
    const [loading, setLoading] = useState(true);
    const [testingChannel, setTestingChannel] = useState<string | null>(null);

    useEffect(() => {
        fetchDiagnostics();
    }, []);

    const fetchDiagnostics = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/notifications/diagnostics');
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err: any) {
            toast.error('Failed to load diagnostics');
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async (channel: string) => {
        setTestingChannel(channel);
        try {
            const res = await apiClient.post('/admin/notifications/test', { channel });
            if (res.data.success) {
                toast.success(`Test ${channel} notification sent! Check your logs/device.`);
            }
        } catch (err: any) {
            toast.error(`Test failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setTestingChannel(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Activity className="w-8 h-8 text-emerald-500" />
                        Notification Diagnostics
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Verify backend connectivity and test notification delivery across all channels.
                    </p>
                </div>
                <button
                    onClick={fetchDiagnostics}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all border border-gray-700"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Stats
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Email Diagnostics */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-white">Email (SMTP)</h3>
                        </div>
                        {data.email.pass !== 'MISSING' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Host:</span> <span className="text-gray-300">{data.email.host}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">User:</span> <span className="text-gray-300">{data.email.user}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Status:</span> <span className={data.email.pass !== 'MISSING' ? 'text-emerald-400' : 'text-red-400'}>{data.email.pass}</span></div>
                    </div>
                    <button
                        onClick={() => handleTest('email')}
                        disabled={!!testingChannel}
                        className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                        {testingChannel === 'email' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Test Email
                    </button>
                </div>

                {/* SMS Diagnostics */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-white">SMS (Termii)</h3>
                        </div>
                        {data.sms.apiKey !== 'NOT SET' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Provider:</span> <span className="text-gray-300">{data.sms.provider}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Sender ID:</span> <span className="text-gray-300">{data.sms.senderId}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">API Key:</span> <span className={data.sms.apiKey !== 'NOT SET' ? 'text-emerald-400' : 'text-red-400'}>{data.sms.apiKey}</span></div>
                    </div>
                    <button
                        onClick={() => handleTest('sms')}
                        disabled={!!testingChannel}
                        className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                        {testingChannel === 'sms' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Test SMS
                    </button>
                </div>

                {/* Push Diagnostics */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                <Bell className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-white">Push (Expo)</h3>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Provider:</span> <span className="text-gray-300">{data.push.provider}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Host:</span> <span className="text-gray-300">{data.push.host}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Env:</span> <span className="text-gray-300 uppercase">{data.env}</span></div>
                    </div>
                    <button
                        onClick={() => handleTest('push')}
                        disabled={!!testingChannel}
                        className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                        {testingChannel === 'push' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send Test Push
                    </button>
                </div>
            </div>

            {/* Database Stats */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8">
                <div className="flex items-center gap-4 flex-1">
                    <div className="p-4 rounded-2xl bg-gray-800 text-emerald-500">
                        <Database className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Push Registration Stats</h3>
                        <p className="text-gray-400 text-sm">Overview of users who can receive push notifications.</p>
                    </div>
                </div>
                <div className="flex gap-12">
                    <div className="text-center">
                        <p className="text-3xl font-black text-white">{data.database.totalUsers}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Total Users</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-black text-emerald-500">{data.database.usersWithPushTokens}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Active Tokens</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-black text-blue-500">
                            {data.database.totalUsers > 0 ? Math.round((data.database.usersWithPushTokens / data.database.totalUsers) * 100) : 0}%
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Coverage</p>
                    </div>
                </div>
            </div>

            {/* Alert Box */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                <div className="text-sm">
                    <p className="text-amber-200 font-semibold">Important Note on Testing</p>
                    <p className="text-amber-200/70 mt-1 leading-relaxed">
                        Test notifications are sent to <span className="font-bold underline">your</span> account. Make sure your email and phone number are correctly set in your profile. 
                        Push notifications will only arrive if you have granted permissions and are using a physical device (not an emulator or Expo Go).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminNotificationDiagnosticsPage;
