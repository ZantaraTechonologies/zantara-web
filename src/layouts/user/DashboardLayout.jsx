import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
    Search
} from 'lucide-react';
import Navbar from '../../components/navigation/Navbar';

export default function DashboardLayout() {
    const { logout, user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const menuItems = [
        { path: '/app/wallet', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/app/buy/data', label: 'Buy Data', icon: Wallet },
        { path: '/app/transactions', label: 'Transactions', icon: ArrowLeftRight },
        { path: '/app/referral', label: 'Refer & Earn', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-16 h-[calc(100vh-64px)]">
                    <div className="p-6">
                        <div className="bg-sky-50 rounded-2xl p-4 mb-6">
                            <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">User Account</div>
                            <div className="text-slate-900 font-bold truncate">{user?.name || 'Zantara User'}</div>
                            <div className="text-slate-500 text-xs truncate">{user?.email || ''}</div>
                        </div>

                        <nav className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                                                isActive 
                                                ? "bg-sky-600 text-white shadow-lg shadow-sky-100" 
                                                : "text-slate-600 hover:bg-slate-50 hover:text-sky-600"
                                            }`
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-sky-600"}`} />
                                            <span className="font-semibold text-sm">{item.label}</span>
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4" />}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto p-6 border-t border-slate-100">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition-colors group"
                        >
                            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
