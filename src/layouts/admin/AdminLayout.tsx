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
    ChevronRight,
    BadgeDollarSign,
    BarChart3,
    History,
    Receipt,
    Users,
    User,
    ShieldCheck,
    MessageSquare,
    Bell,
    BadgePercent,
    FileText,
    PieChart,
    LucideIcon
} from "lucide-react";
import Navbar from "../../components/navigation/Navbar";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { hasAnyRole } from "../../utils/access";

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { admin } = useAdminAuth();
    const isSuperAdmin = hasAnyRole(admin, ['superAdmin']);

    // Simplified logout for admin since auth context/store is separated.
    const handleLogout = () => {
        // clear any admin tokens if needed here
        navigate("/admin/login");
    };

    interface MenuItem {
        path?: string;
        label: string;
        icon?: LucideIcon;
        type?: "header";
    }

    // All admins can see these operational pages
    const baseMenuItems: MenuItem[] = [
        { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/admin/users", label: "User Management", icon: Users },
        { path: "/admin/kyc", label: "KYC Queue", icon: ShieldCheck },
        { path: "/admin/transactions", label: "Transactions", icon: ListOrdered },
        { path: "/admin/withdrawals", label: "Withdrawals", icon: Banknote },
        { path: "/admin/support", label: "Support Tickets", icon: MessageSquare },
        { path: "/admin/notifications", label: "Message Center", icon: Bell },
        { path: "/admin/profile", label: "My Profile", icon: User },
    ];

    // Only superAdmins see these sensitive pages
    const superAdminMenuItems: MenuItem[] = [
        { type: "header", label: "Business & Finance" },
        { path: "/admin/business/overview", label: "Business Overview", icon: BadgeDollarSign },
        { path: "/admin/business/earnings", label: "Earnings Analytics", icon: BadgePercent },
        { path: "/admin/business/commissions", label: "Financial Protocols", icon: ShieldCheck },
        { path: "/admin/business/wallet", label: "System Liquidity", icon: WalletCards },
        { path: "/admin/business/treasury", label: "Treasury Ledger", icon: Receipt },
        { path: "/admin/business/profit", label: "Profit Analytics", icon: BarChart3 },
        { path: "/admin/business/shareholders", label: "Shareholders", icon: PieChart },
        { type: "header", label: "System" },
        { path: "/admin/status", label: "System Status", icon: Activity },
        { path: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
        { path: "/admin/settings", label: "Settings", icon: Settings },
    ];

    const menuItems: MenuItem[] = isSuperAdmin
        ? [...baseMenuItems, ...superAdminMenuItems]
        : baseMenuItems;

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
            <Navbar />

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 bg-slate-950 border-r border-white/5 flex-col shrink-0">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                        <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/5">
                            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mb-2">Institutional</div>
                            <div className="text-white font-bold truncate text-sm">Zantara Admin</div>
                            <div className="text-slate-500 text-[11px] font-medium truncate mt-1">Operator: ROOT</div>
                        </div>

                        <nav className="space-y-2">
                            {menuItems.map((item, idx) => {
                                if (item.type === "header") {
                                    return (
                                        <div key={idx} className="px-5 py-2 mt-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                                            {item.label}
                                        </div>
                                    );
                                }
                                const Icon = item.icon!;
                                const path = item.path!;
                                const isActive = location.pathname.startsWith(path);
                                return (
                                    <NavLink
                                        key={path}
                                        to={path}
                                        className={({ isActive }) =>
                                            `flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                                                isActive
                                                    ? "bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20"
                                                    : "text-slate-400 hover:bg-white/5 hover:text-emerald-400"
                                            }`
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            {Icon && <Icon className={`w-5 h-5 ${isActive ? "text-slate-950" : "text-slate-500 group-hover:text-emerald-400"}`} />}
                                            <span className="font-semibold text-sm tracking-tight">{item.label}</span>
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-5 border-t border-white/5 bg-slate-950">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 font-bold text-sm rounded-xl hover:bg-red-50/10 hover:text-red-400 transition-all group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>Terminate Session</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 overflow-y-auto bg-slate-950 custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto p-5 md:p-6 pb-12">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}