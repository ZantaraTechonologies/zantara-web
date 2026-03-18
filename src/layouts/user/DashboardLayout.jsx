import React, { useState } from 'react';
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
    Zap
} from 'lucide-react';
import Navbar from '../../components/navigation/Navbar';

export default function DashboardLayout() {
    const { logout, user } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const menuItems = [
        { path: '/app', label: 'Overview', icon: LayoutDashboard },
        { path: '/app/wallet', label: 'Wallet', icon: Wallet },
        { path: '/app/buy/data', label: 'Buy Data', icon: Zap },
        { path: '/app/transactions', label: 'Transactions', icon: ArrowLeftRight },
        { path: '/app/referral', label: 'Refer & Earn', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col sticky top-20 h-[calc(100vh-80px)]">
                    <div className="p-6">
                        <div className="bg-emerald-50 rounded-[2rem] p-4 mb-6 border border-emerald-100/50">
                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">User Account</div>
                            <div className="text-slate-900 font-bold truncate text-sm">{user?.name || 'Zantara User'}</div>
                            <div className="text-slate-400 text-[11px] font-bold truncate mt-1">{user?.email || ''}</div>
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
                                            `flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                                                isActive 
                                                ? "bg-slate-950 text-emerald-400 shadow-xl shadow-slate-950/20" 
                                                : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"
                                            }`
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-600"}`} />
                                            <span className="font-semibold text-sm tracking-tight">{item.label}</span>
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto p-6 border-t border-slate-50">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 font-bold text-sm rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50/30">
                    <div className="max-w-7xl mx-auto p-5 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
