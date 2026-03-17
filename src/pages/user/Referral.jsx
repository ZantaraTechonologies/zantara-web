import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from "../../services/api/apiClient";
import { Users } from 'lucide-react';

export default function Referral() {
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Refer & Earn</h1>
                <p className="text-slate-500 font-medium">Invite your friends and earn 2% on their first transaction</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-sky-600 rounded-3xl p-8 text-white shadow-xl shadow-sky-100 flex flex-col justify-between min-h-[160px]">
                    <p className="text-sky-100 text-sm font-bold uppercase tracking-wider">Total Earnings</p>
                    <h2 className="text-4xl font-black">₦{stats.earnings.toLocaleString()}</h2>
                </div>
                
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px]">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Referrals</p>
                    <h2 className="text-4xl font-black text-slate-900">{stats.count}</h2>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px]">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Your Referral Code</p>
                    <div className="flex items-center justify-between gap-4 bg-slate-50 p-2 pl-4 rounded-2xl border border-slate-100">
                        <code className="text-xl font-black text-sky-600 tracking-wider">{stats.code}</code>
                        <button
                            onClick={copyLink}
                            className="bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-md shadow-sky-50 active:scale-95"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* History Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="font-bold text-slate-900">Referral History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Bonus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats.history.length > 0 ? (
                                    stats.history.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-semibold text-slate-700">{item.user}</td>
                                            <td className="p-4 text-slate-500 text-sm">{item.date}</td>
                                            <td className="p-4">
                                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">Active</span>
                                            </td>
                                            <td className="p-4 font-bold text-emerald-600">+₦{item.amount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="w-12 h-12 text-slate-200" />
                                                <p className="font-medium">No referrals yet. Share your code to get started!</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white h-fit shadow-xl shadow-slate-200">
                    <h3 className="text-xl font-black mb-6">How it works</h3>
                    <ul className="space-y-6">
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-sky-600 text-white rounded-xl flex items-center justify-center font-bold">1</span>
                            <div>
                                <p className="font-bold text-sky-400">Share Code</p>
                                <p className="text-slate-400 text-sm mt-1">Copy and send your unique code to friends.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-slate-800 text-sky-600 rounded-xl flex items-center justify-center font-bold">2</span>
                            <div>
                                <p className="font-bold text-slate-200">They Sign Up</p>
                                <p className="text-slate-400 text-sm mt-1">They enter your code during registration.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-slate-800 text-sky-600 rounded-xl flex items-center justify-center font-bold">3</span>
                            <div>
                                <p className="font-bold text-slate-200">Get 2% Bonus</p>
                                <p className="text-slate-400 text-sm mt-1">Earn instantly on their first transaction.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
