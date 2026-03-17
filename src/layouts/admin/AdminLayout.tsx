import React from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    ListOrdered,
    Banknote,
    WalletCards,
    Settings,
    Link as LinkIcon,
    Activity,
    LogOut,
    ChevronRight
} from "lucide-react";
import Navbar from "../../components/navigation/Navbar";

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    // Simplified logout for admin since auth context/store is separated.
    const handleLogout = () => {
        // clear any admin tokens if needed here
        navigate("/admin/login");
    };

    const menuItems = [
        { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/admin/transactions", label: "Transactions", icon: ListOrdered },
        { path: "/admin/withdrawals", label: "Withdrawals", icon: Banknote },
        { path: "/admin/wallets", label: "Wallets", icon: WalletCards },
        { path: "/admin/services", label: "Services Ops", icon: Settings },
        { path: "/admin/payments", label: "Payments/Webhooks", icon: LinkIcon },
        { path: "/admin/status", label: "System Status", icon: Activity },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-16 h-[calc(100vh-64px)]">
                    <div className="p-6">
                        <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Admin Console</div>
                            <div className="text-slate-900 font-bold truncate">VTU Administrator</div>
                            <div className="text-slate-500 text-xs truncate">System Management</div>
                        </div>

                        <nav className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                                                isActive
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                                            }`
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
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
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition-colors group"
                        >
                            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50/50">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}