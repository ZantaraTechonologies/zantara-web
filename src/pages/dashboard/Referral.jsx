import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Adjust path as needed
import api from '../../api/axios';

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
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Referral Program</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Earnings</p>
                    <h2 className="text-3xl font-bold">₦{stats.earnings.toLocaleString()}</h2>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Referrals</p>
                    <h2 className="text-3xl font-bold text-gray-800">{stats.count}</h2>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium mb-1">Your Code</p>
                    <div className="flex items-center gap-2">
                        <code className="text-2xl font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{stats.code}</code>
                        <button
                            onClick={copyLink}
                            className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-800 transition"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* History Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Referral History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Bonus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.history.length > 0 ? (
                                    stats.history.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="p-4">{item.user}</td>
                                            <td className="p-4 text-gray-500">{item.date}</td>
                                            <td className="p-4">
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                                            </td>
                                            <td className="p-4 font-medium text-green-600">+₦{item.amount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-500">
                                            No referrals yet. Share your code to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 h-fit">
                    <h3 className="font-bold text-blue-900 mb-4">How it works</h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                            <p className="text-blue-800 text-sm">Share your unique referral code with friends and family.</p>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                            <p className="text-blue-800 text-sm">They sign up using your code during registration.</p>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                            <p className="text-blue-800 text-sm">You earn 2% commission on their first transaction instantly!</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
