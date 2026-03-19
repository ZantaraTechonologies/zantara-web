import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';
import { 
    Shield, 
    Key, 
    Fingerprint, 
    Smartphone, 
    ChevronRight, 
    ArrowLeft,
    ShieldCheck,
    Lock
} from 'lucide-react';

const UserSecuritySettingsPage: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const securityItems = [
        {
            title: 'Transaction PIN',
            description: user?.hasPIN ? 'Your 4-digit security PIN is active' : 'Setup a 4-digit PIN for transactions',
            icon: Fingerprint,
            path: '/app/profile/security/pin',
            status: user?.hasPIN ? 'active' : 'setup',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            title: 'Change Password',
            description: 'Regularly update your password for safety',
            icon: Key,
            path: '/app/profile/security/password',
            status: 'active',
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            title: 'Two-Factor Auth',
            description: 'Add an extra layer of protection (Coming Soon)',
            icon: Smartphone,
            path: '#',
            status: 'locked',
            color: 'text-slate-400',
            bg: 'bg-slate-50'
        }
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/app/profile')}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Protocol</h1>
                    <p className="text-sm text-slate-500 font-medium">Protect your capital and account data</p>
                </div>
            </div>

            {/* Security Summary */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-900 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl transition-all group-hover:bg-emerald-500/20"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Protection Level: High</span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Account Shield</h2>
                        <p className="text-slate-400 text-sm font-medium">Verified session active from your local device.</p>
                    </div>
                    <div className="hidden sm:flex w-20 h-20 bg-white/5 rounded-2xl items-center justify-center border border-white/10">
                        <ShieldCheck size={40} className="text-emerald-400" />
                    </div>
                </div>
            </div>

            {/* Security Controls */}
            <div className="grid gap-4">
                {securityItems.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => item.path !== '#' && navigate(item.path)}
                        disabled={item.status === 'locked'}
                        className={`p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 ${item.status === 'locked' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <div className="flex items-center gap-5">
                            <div className={`${item.bg} ${item.color} w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-black/5`}>
                                <item.icon size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    {item.title}
                                    {item.status === 'locked' && <Lock size={12} className="text-slate-400" />}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium">{item.description}</p>
                            </div>
                        </div>
                        {item.status !== 'locked' && (
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                                <ChevronRight size={20} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Note */}
            <div className="bg-blue-50/50 p-6 rounded-2xl flex items-start gap-4 border border-blue-100/50">
                <div className="p-2 bg-white rounded-xl border border-blue-100 text-blue-500">
                    <Shield size={20} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Security Recommendation</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Activate your 4-digit PIN for immediate account protection during high-value transactions. Never share your password or PIN with anyone claiming to be from Zantara support.</p>
                </div>
            </div>
        </div>
    );
};

export default UserSecuritySettingsPage;
