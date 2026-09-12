import React from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';
import {
    LayoutDashboard,
    Wallet,
    ArrowLeftRight,
    Users,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronRight,
    Search,
    Zap,
    User,
    HelpCircle,
    TrendingUp
} from 'lucide-react';
import Navbar from '../../components/navigation/Navbar';
import LegalAcceptancePrompt from '../../components/legal/LegalAcceptancePrompt';

export default function DashboardLayout() {
    const { logout, user } = useAuthStore();
    const location = useLocation();

    const menuItems = [
        { path: '/app', label: 'Overview', icon: LayoutDashboard },
        { path: '/app/services', label: 'Services', icon: Zap },
        { path: '/app/transactions', label: 'Transactions', icon: ArrowLeftRight },
        { path: '/app/profile', label: 'Profile', icon: User },
        { path: '/app/referral', label: 'Refer & Earn', icon: Users },
        { path: '/app/investments', label: 'Investments', icon: TrendingUp },
        { path: '/app/support', label: 'Support', icon: HelpCircle },
    ];

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
            <LegalAcceptancePrompt />
            <Navbar />

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 bg-surface border-r border-slate-100 flex-col shrink-0">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                        <div className="bg-brand-mint/60 rounded-2xl p-4 mb-6 border border-brand-emerald/20">
                            <div className="text-[10px] font-semibold text-brand-emerald uppercase tracking-[0.2em] mb-2">User Account</div>
                            <div className="text-brand-navy font-semibold truncate text-sm">{user?.name || 'Zantara User'}</div>
                            <div className="text-slate-400 text-[11px] font-medium truncate mt-1">{user?.email || ''}</div>
                        </div>

                        <nav className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
                                                ? "bg-brand-emerald/10 text-brand-emerald font-semibold"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-brand-navy"
                                            }`
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 ${isActive ? "text-brand-emerald" : "text-slate-400 group-hover:text-brand-emerald"}`} />
                                            <span className="text-sm tracking-tight">{item.label}</span>
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4 text-brand-emerald" />}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-5 border-t border-slate-100">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 font-semibold text-sm rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50 custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto p-5 md:p-6 pb-12">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
