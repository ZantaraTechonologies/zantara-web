import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';
import { 
    User, 
    Shield, 
    ChevronRight, 
    Mail, 
    Phone, 
    BadgeCheck, 
    Lock, 
    Camera,
    Wallet,
    Bell
} from 'lucide-react';

const UserProfilePage: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const menuItems = [
        {
            title: 'Personal Information',
            description: 'Manage your name, email, and identity details',
            icon: User,
            path: '/app/profile/personal',
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            title: 'Security & Password',
            description: 'Update password and transaction PIN settings',
            icon: Lock,
            path: '/app/profile/security',
            color: 'text-purple-500',
            bg: 'bg-purple-50'
        },
        {
            title: 'Verification (KYC)',
            description: 'Upgrade your account limits and verification status',
            icon: Shield,
            path: '/app/kyc',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            title: 'Notification Preferences',
            description: 'Control how you receive alerts and updates',
            icon: Bell,
            path: '#',
            color: 'text-orange-500',
            bg: 'bg-orange-50'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Profile Header Card */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/40">
                <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                </div>
                
                <div className="px-8 pb-8 flex flex-col sm:flex-row items-end gap-6 -mt-12 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl">
                            <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden relative">
                                <User size={48} strokeWidth={1.5} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                                    <Camera size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                            <BadgeCheck size={20} />
                        </div>
                    </div>

                    <div className="flex-1 pb-2 space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name || 'Zantara User'}</h1>
                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                                user?.kycStatus === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                user?.kycStatus === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                'bg-slate-50 text-slate-400 border-slate-100'
                            }`}>
                                {user?.kycStatus === 'verified' ? 'Verified Level 2' : 
                                 user?.kycStatus === 'pending' ? 'Verification Pending' : 
                                 'Starter Level 1'}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5">
                                <Mail size={14} className="text-slate-400" />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Phone size={14} className="text-slate-400" />
                                <span>{user?.phone}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/app/profile/personal')}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Account Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <Wallet size={20} />
                    </div>
                    <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Type</p>
                         <p className="font-bold text-slate-900">Personal Savings</p>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
                        <Shield size={20} />
                    </div>
                    <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Level</p>
                         <p className="font-bold text-slate-900">{user?.hasPIN ? 'High-Security' : 'Standard'}</p>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                        <BadgeCheck size={20} />
                    </div>
                    <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KYC Status</p>
                         <p className={`font-bold uppercase ${
                            user?.kycStatus === 'verified' ? 'text-emerald-600' :
                            user?.kycStatus === 'pending' ? 'text-orange-600' :
                            'text-slate-400'
                         }`}>
                            {user?.kycStatus === 'verified' ? 'Level 2' :
                             user?.kycStatus === 'pending' ? 'Pending' :
                             'Level 1'}
                         </p>
                    </div>
                 </div>
            </div>

            {/* Menu List */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-50">
                    {menuItems.map((item, idx) => (
                        <button 
                            key={idx}
                            onClick={() => navigate(item.path)}
                            className="w-full p-6 flex items-center gap-5 hover:bg-slate-50 transition-colors group text-left"
                        >
                            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                <item.icon size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900">{item.title}</h4>
                                <p className="text-xs text-slate-500 font-medium">{item.description}</p>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 flex items-center justify-between">
                <div className="space-y-1">
                    <h4 className="font-bold text-red-900">Deactivate Account</h4>
                    <p className="text-xs text-red-700/70 font-medium whitespace-nowrap">Temporarily disable your access to Zantara</p>
                </div>
                <button className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors px-4 py-2 border border-red-200 rounded-lg hover:bg-red-100/50">
                    Deactivate
                </button>
            </div>
        </div>
    );
};

export default UserProfilePage;
