import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    Activity, 
    PieChart, 
    TrendingUp, 
    History, 
    Clock, 
    ArrowRight, 
    RefreshCcw, 
    Search, 
    Zap,
    Info,
    X
} from 'lucide-react';
import StrategicPulseTab from './StrategicPulseTab';
import MarginAnalysisTab from './MarginAnalysisTab';
import PayoutDynamicsTab from './PayoutDynamicsTab';
import TreasuryLedgerTab from './TreasuryLedgerTab';

const AdminFinancialHubPage: React.FC = () => {
    const location = useLocation();
    const [showNotice, setShowNotice] = useState(!!location.state?.consolidated);
    const [activeTab, setActiveTab] = useState<'pulse' | 'margins' | 'payouts' | 'ledger'>('pulse');
    const [period, setPeriod] = useState<'this-month' | 'last-30-days' | 'all-time' | 'custom'>('this-month');
    const [customDates, setCustomDates] = useState({ 
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
        end: new Date().toISOString().split('T')[0] 
    });

    const tabs = [
        { id: 'pulse', label: 'Strategic Pulse', icon: Activity, desc: 'Global platform health & growth' },
        { id: 'margins', label: 'Margin Analysis', icon: PieChart, desc: 'Yield efficiency per category' },
        { id: 'payouts', label: 'Payout Dynamics', icon: TrendingUp, desc: 'Referral & Agent distribution' },
        { id: 'ledger', label: 'Treasury Ledger', icon: History, desc: 'Unified activity & expense log' },
    ];

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {showNotice && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-3xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Info size={16} />
                        </div>
                        <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest italic">
                            Architecture Update: Legacy finance pages have been consolidated into this unified Intelligence Hub.
                        </p>
                    </div>
                    <button onClick={() => setShowNotice(false)} className="text-slate-500 hover:text-white p-2">
                        <X size={16} />
                    </button>
                </div>
            )}
            {/* Header & Main Slicer */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Financial Command & Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">Intelligence Hub</h1>
                    <p className="text-slate-500 text-xs font-medium mt-2 max-w-xl leading-relaxed uppercase tracking-tighter">
                        Unified financial monitoring across <span className="text-indigo-400">Revenue</span>, <span className="text-emerald-400">Yield</span>, and <span className="text-rose-400">Expenditure</span> streams.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 border border-white/5 p-2 rounded-[2rem] shadow-2xl backdrop-blur-md">
                    <div className="flex bg-slate-950 p-1 rounded-2xl overflow-x-auto no-scrollbar">
                        {(['this-month', 'last-30-days', 'all-time', 'custom'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setPeriod(r)}
                                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    period === r ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-white"
                                }`}
                            >
                                {r.replace(/-/g, ' ')}
                            </button>
                        ))}
                    </div>

                    {period === 'custom' && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300 px-2">
                            <input 
                                type="date" 
                                className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-white text-[10px] font-black uppercase outline-none color-scheme-dark"
                                value={customDates.start}
                                onChange={(e) => setCustomDates({...customDates, start: e.target.value})}
                            />
                            <ArrowRight size={14} className="text-slate-700" />
                            <input 
                                type="date" 
                                className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-white text-[10px] font-black uppercase outline-none color-scheme-dark"
                                value={customDates.end}
                                onChange={(e) => setCustomDates({...customDates, end: e.target.value})}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`p-6 rounded-[2rem] border transition-all text-left flex items-start gap-4 group relative overflow-hidden ${
                                isActive 
                                ? "bg-white border-white shadow-2xl shadow-white/5" 
                                : "bg-slate-900 border-white/5 hover:border-white/10"
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                                isActive ? "bg-slate-900 text-white" : "bg-white/5 text-slate-500 group-hover:text-white"
                            }`}>
                                <tab.icon size={22} />
                            </div>
                            <div className="relative z-10">
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? "text-slate-500" : "text-slate-600"}`}>Module Node</p>
                                <h3 className={`text-sm font-black italic tracking-tight ${isActive ? "text-slate-950" : "text-white"}`}>{tab.label}</h3>
                                <p className={`text-[10px] font-medium mt-1 leading-tight ${isActive ? "text-slate-400" : "text-slate-500"}`}>{tab.desc}</p>
                            </div>
                            {isActive && <div className="absolute top-0 right-0 p-4"><Zap size={14} className="text-indigo-500 animate-pulse" /></div>}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'pulse' && <StrategicPulseTab period={period} customDates={customDates} />}
                {activeTab === 'margins' && <MarginAnalysisTab period={period} customDates={customDates} />}
                {activeTab === 'payouts' && <PayoutDynamicsTab period={period} customDates={customDates} />}
                {activeTab === 'ledger' && <TreasuryLedgerTab period={period} customDates={customDates} />}
            </div>
        </div>
    );
};

export default AdminFinancialHubPage;
