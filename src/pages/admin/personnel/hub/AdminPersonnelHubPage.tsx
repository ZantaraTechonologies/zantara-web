import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    Users, 
    ShieldCheck, 
    UserPlus, 
    Activity,
    Search
} from 'lucide-react';
import UserDirectoryTab from './UserDirectoryTab';
import VerificationQueueTab from './VerificationQueueTab';

const AdminPersonnelHubPage: React.FC = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'directory' | 'verification' | 'operators'>('directory');

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location]);

    const tabs = [
        { id: 'directory', label: 'User Directory', icon: Users, desc: 'Global Registry' },
        { id: 'verification', label: 'Verification Queue', icon: ShieldCheck, desc: 'KYC Compliance' },
        { id: 'operators', label: 'Admin Operators', icon: UserPlus, desc: 'Internal Teams' },
    ];

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Personnel & Compliance Management</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Personnel Hub</h1>
                    <p className="text-slate-500 text-xs font-medium mt-2 max-w-xl leading-relaxed uppercase tracking-tighter">
                        Unified interface for <span className="text-indigo-400">User Identity</span>, <span className="text-emerald-400">KYC Verification</span>, and <span className="text-amber-400">Security Protocols</span>.
                    </p>
                </div>

                <div className="bg-surface border border-slate-100 p-4 rounded-3xl backdrop-blur-md flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <Activity size={18} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Security Node</p>
                        <p className="text-xs font-black text-slate-900 mt-1 uppercase tracking-tighter">Identity Services Active</p>
                    </div>
                </div>
            </div>

            {/* Hub Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isComingSoon = tab.id === 'operators';
                    return (
                        <button
                            key={tab.id}
                            disabled={isComingSoon}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`p-6 rounded-3xl border transition-all text-left flex items-start gap-5 group relative overflow-hidden ${
                                isActive 
                                ? "bg-surface border border-slate-200 shadow-sm" 
                                : isComingSoon 
                                ? "bg-slate-50 border border-slate-100 opacity-50 cursor-not-allowed"
                                : "bg-slate-100 border border-slate-100 hover:border-slate-200"
                            }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                                isActive ? "bg-slate-950 text-white shadow-sm" : "bg-slate-100 text-slate-600 group-hover:text-slate-900"
                            }`}>
                                <tab.icon size={26} />
                            </div>
                            <div className="relative z-10">
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? "text-slate-400" : "text-slate-600"}`}>
                                    {isComingSoon ? "Deferred Node" : "Personnel Module"}
                                </p>
                                <h3 className={`text-base font-black tracking-tight ${isActive ? "text-slate-950" : "text-slate-900"}`}>{tab.label}</h3>
                                <p className={`text-[11px] font-medium mt-1 leading-tight ${isActive ? "text-slate-400" : "text-slate-500"}`}>{tab.desc}</p>
                            </div>
                            
                            {isComingSoon && (
                                <div className="absolute top-4 right-6 px-2 py-0.5 bg-slate-100 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest">Later</div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content Area */}
            <div className="min-h-[480px] bg-surface border border-slate-100 rounded-3xl p-1">
                <div className="p-6 sm:p-6">
                    {activeTab === 'directory' && <UserDirectoryTab />}
                    {activeTab === 'verification' && <VerificationQueueTab />}
                </div>
            </div>
        </div>
    );
};

export default AdminPersonnelHubPage;
