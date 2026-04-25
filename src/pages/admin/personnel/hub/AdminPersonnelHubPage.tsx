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
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Personnel & Compliance Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">Personnel Hub</h1>
                    <p className="text-slate-500 text-xs font-medium mt-2 max-w-xl leading-relaxed uppercase tracking-tighter">
                        Unified interface for <span className="text-indigo-400">User Identity</span>, <span className="text-emerald-400">KYC Verification</span>, and <span className="text-amber-400">Security Protocols</span>.
                    </p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl backdrop-blur-md flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500">
                        <Activity size={18} />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Security Node</p>
                        <p className="text-xs font-black text-white mt-1 uppercase tracking-tighter">Identity Services Active</p>
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
                            className={`p-8 rounded-[3rem] border transition-all text-left flex items-start gap-5 group relative overflow-hidden ${
                                isActive 
                                ? "bg-white border-white shadow-2xl shadow-white/5" 
                                : isComingSoon 
                                ? "bg-slate-900/20 border-white/5 opacity-50 cursor-not-allowed"
                                : "bg-slate-900 border-white/5 hover:border-white/10"
                            }`}
                        >
                            <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-colors ${
                                isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-950/20" : "bg-white/5 text-slate-600 group-hover:text-white"
                            }`}>
                                <tab.icon size={26} />
                            </div>
                            <div className="relative z-10">
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? "text-slate-400" : "text-slate-600"}`}>
                                    {isComingSoon ? "Deferred Node" : "Personnel Module"}
                                </p>
                                <h3 className={`text-base font-black italic tracking-tight ${isActive ? "text-slate-950" : "text-white"}`}>{tab.label}</h3>
                                <p className={`text-[11px] font-medium mt-1 leading-tight ${isActive ? "text-slate-400" : "text-slate-500"}`}>{tab.desc}</p>
                            </div>
                            
                            {isComingSoon && (
                                <div className="absolute top-4 right-6 px-2 py-0.5 bg-slate-800 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest">Later</div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content Area */}
            <div className="min-h-[600px] bg-slate-900/10 rounded-[4rem] p-1 border border-white/5">
                <div className="p-8 sm:p-12">
                    {activeTab === 'directory' && <UserDirectoryTab />}
                    {activeTab === 'verification' && <VerificationQueueTab />}
                </div>
            </div>
        </div>
    );
};

export default AdminPersonnelHubPage;
