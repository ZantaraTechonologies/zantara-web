import React, { useState } from 'react';
import { 
    User, 
    Mail, 
    Phone, 
    Shield, 
    Lock, 
    KeyRound, 
    Eye, 
    EyeOff,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/auth/authStore';
import apiClient from '../../services/api/apiClient';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const AdminProfilePage: React.FC = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ old: false, new: false });
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error('New passwords do not match');
        }

        if (passwords.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await apiClient.post('/auth/change-password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Password updated successfully');
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const adminStats = [
        { label: 'Role', value: user?.role?.toUpperCase() || 'ADMIN', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Status', value: 'Active', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Last Login', value: user?.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, HH:mm') : 'Recently', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">My Account</h1>
                <p className="text-slate-500 font-medium">Manage your administrative credentials and security settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-slate-900 to-slate-800"></div>
                        
                        <div className="relative pt-8">
                            <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto text-slate-900 font-black text-3xl shadow-2xl shadow-emerald-500/20 border-4 border-white mb-4">
                                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">{user?.role}</p>
                        </div>

                        <div className="mt-8 space-y-4 text-left">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                                <Mail size={18} className="text-slate-400" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-xs font-bold text-slate-900 truncate">{user?.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                                <Phone size={18} className="text-slate-400" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-xs font-bold text-slate-900 truncate">{user?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {adminStats.map((stat, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <p className="text-xs font-black text-slate-900 tracking-tight">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Settings */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8 h-full">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                <KeyRound size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Security Credentials</h3>
                                <p className="text-sm text-slate-400 font-medium">Update your administrative access password.</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Current Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input 
                                            type={showPasswords.old ? 'text' : 'password'}
                                            placeholder="Enter current password"
                                            value={passwords.oldPassword}
                                            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-14 pr-14 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                            required
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                        >
                                            {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">New Password</label>
                                        <div className="relative group">
                                            <input 
                                                type={showPasswords.new ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={passwords.newPassword}
                                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-200"
                                                required
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                            >
                                                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Confirm New Password</label>
                                        <div className="relative group">
                                            <input 
                                                type={showPasswords.new ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={passwords.confirmPassword}
                                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-200"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading || !passwords.oldPassword || !passwords.newPassword}
                                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        <Shield size={18} />
                                        Update Security Credentials
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-6 border-t border-slate-50 text-[11px] text-slate-400 font-medium italic flex items-start gap-2">
                            <Info size={14} className="shrink-0 mt-0.5" />
                            Changing your password will log you out from other devices and require you to sign in again for security purposes.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
