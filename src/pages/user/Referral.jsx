import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth/authStore';
import { useWalletStore } from '../../store/wallet/walletStore';
import api from "../../services/api/apiClient";
import { Users } from 'lucide-react';

export default function Referral() {
    const { currency } = useWalletStore();
    const [stats, setStats] = useState({
        earnings: 0,
        count: 0,
        code: 'LOADING...',
        history: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            const { data } = await api.get('/auth/me');

            setStats({
                earnings: data.totalReferralBonus || 0,
                count: 0, // Backend doesn't return count yet
                code: data.myReferralCode || '------',
                history: []
            });
        } catch (error) {
            console.error("Failed to fetch referral data", error);
            setStats(prev => ({ ...prev, code: 'ERROR' }));
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(stats.code);
        alert('Referral code copied!');
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Refer & Earn</h1>
                <p className="text-slate-500 font-medium text-sm">Invite your friends and earn 2% on their first transaction</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-400 rounded-2xl p-6 text-slate-950 shadow-xl shadow-emerald-500/10 flex flex-col justify-between min-h-[140px]">
                    <p className="text-slate-950/60 text-[10px] font-bold uppercase tracking-[0.2em]">Total Earnings</p>
                    <h2 className="text-4xl font-extrabold tracking-tighter">{currency}{stats.earnings.toLocaleString()}</h2>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 flex flex-col justify-between min-h-[140px]">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Total Referrals</p>
                    <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900">{stats.count}</h2>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 flex flex-col justify-between min-h-[140px]">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Your Referral Code</p>
                    <div className="flex items-center justify-between gap-4 bg-slate-50 p-2 pl-4 rounded-xl border border-slate-100 mt-2">
                        <code className="text-lg font-bold text-emerald-600 tracking-wider font-mono">{stats.code}</code>
                        <button
                            onClick={copyLink}
                            className="bg-slate-950 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-md active:scale-95"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* History Table */}
                <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-50 overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="text-base font-bold text-slate-900">Referral History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Bonus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats.history.length > 0 ? (
                                    stats.history.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold text-xs">
                                                        {item.user[0]}
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-sm">{item.user}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs font-medium">{item.date}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border border-emerald-100">Active</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-emerald-600 text-right">+{currency}{item.amount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                    <Users className="w-8 h-8 text-slate-200" />
                                                </div>
                                                <p className="font-bold tracking-tight text-slate-400">No network history detected yet.</p>
                                                <button onClick={copyLink} className="text-emerald-500 text-xs font-bold uppercase tracking-widest hover:underline">Share Invite Link</button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Instructions */}
                <div className="lg:col-span-4 bg-slate-950 rounded-2xl p-8 text-white h-fit shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    
                    <h3 className="text-xl font-bold mb-8 tracking-tight">Earning Protocol</h3>
                    <ul className="space-y-10 relative z-10">
                        <li className="flex gap-5">
                            <span className="flex-shrink-0 w-10 h-10 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center font-bold text-lg border border-white/10 italic">01</span>
                            <div>
                                <p className="font-bold text-white uppercase text-[11px] tracking-widest">Deploy Link</p>
                                <p className="text-slate-500 text-xs mt-1 font-medium leading-relaxed">Transmit your unique identifier via any secure channel.</p>
                            </div>
                        </li>
                        <li className="flex gap-5">
                            <span className="flex-shrink-0 w-10 h-10 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center font-bold text-lg border border-white/10 italic">02</span>
                            <div>
                                <p className="font-bold text-white uppercase text-[11px] tracking-widest">Identity Linked</p>
                                <p className="text-slate-500 text-xs mt-1 font-medium leading-relaxed">New user authenticates using your specific referral hash.</p>
                            </div>
                        </li>
                        <li className="flex gap-5">
                            <span className="flex-shrink-0 w-10 h-10 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold text-lg italic">03</span>
                            <div>
                                <p className="font-bold text-emerald-400 uppercase text-[11px] tracking-widest">Yield Harvest</p>
                                <p className="text-emerald-500/80 text-xs mt-1 font-bold leading-relaxed">Receive 2% commission instantly on their first settlement.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
