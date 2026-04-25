import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth/authStore";
import { LogOut, Menu, X, LayoutDashboard, Bell, Search, Users, ShieldCheck, ListOrdered, Banknote, MessageSquare, Activity, Zap, CreditCard, User, ArrowUpRight, HelpCircle, BadgeDollarSign, BadgePercent, WalletCards, BarChart3, History, ChevronRight, Settings, PieChart } from "lucide-react";

import { useSiteSettings } from "../../app/SiteSettingsContext";

export default function Navbar() {
    const { settings } = useSiteSettings();
    const { isAuthenticated, logout, user } = useAuthStore();
    const [open, setOpen] = useState(false);
    const location = useLocation();

    // Body-scroll lock when menu is open
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [open]);

    const isAdmin = location.pathname.startsWith('/admin');

    const linkBase = "inline-flex items-center text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors";

    const adminMenuItems = [
        { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/admin/users", label: "User Management", icon: Users },
        { path: "/admin/kyc", label: "KYC Queue", icon: ShieldCheck },
        { path: "/admin/transactions", label: "Transactions", icon: ListOrdered },
        { path: "/admin/withdrawals", label: "Withdrawals", icon: Banknote },
        { path: "/admin/support", label: "Support Tickets", icon: MessageSquare },
        { path: "/admin/notifications", label: "Message Center", icon: Bell },
        { path: "/admin/status", label: "System Status", icon: Activity },
        { header: "Business & Finance" },
        { path: "/admin/business/intelligence", label: "Intelligence Hub", icon: Zap },
        { path: "/admin/business/commissions", label: "Commission & Discounts", icon: BadgePercent },
        { path: "/admin/business/wallet", label: "System Liquidity", icon: WalletCards },
        { path: "/admin/business/shareholders", label: "Shareholders", icon: PieChart },
        { header: "System & Security" },
        { path: "/admin/status", label: "System Status", icon: Activity },
        { path: "/admin/audit-logs", label: "Audit Logs", icon: Activity },
        { path: "/admin/settings", label: "System Parameters", icon: Settings },
        { path: "/admin/profile", label: "My Profile", icon: User },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center">
            <div className="mx-auto max-w-7xl w-full px-6 sm:px-12">
                <div className="flex items-center justify-between gap-8">
                    {/* Brand */}
                    <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-3">
                        <img src="/app_store_icon.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg" />
                        <span className="text-xl font-bold text-slate-900 tracking-tight uppercase">{settings.SITE_NAME} {isAdmin && <span className="text-emerald-500 ml-1">Admin</span>}</span>
                    </Link>

                    {/* Desktop nav (Conditional) */}
                    {isAuthenticated ? (
                        <div className="hidden lg:flex flex-1 items-center justify-between">
                            <nav className="flex items-center gap-8 ml-8">
                                {!isAdmin ? (
                                    <>
                                        <NavLink
                                            to="/app"
                                            end
                                            className={({ isActive }) =>
                                                `${linkBase} ${isActive ? "text-emerald-600" : ""}`
                                            }
                                        >
                                            Dashboard
                                        </NavLink>
                                        <NavLink
                                            to="/app/transactions"
                                            className={({ isActive }) =>
                                                `${linkBase} ${isActive ? "text-emerald-600" : ""}`
                                            }
                                        >
                                            Transactions
                                        </NavLink>
                                    </>
                                ) : (
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Institutional Control Panel</span>
                                )}
                            </nav>

                            <div className="flex items-center gap-6">
                                <div className="relative hidden xl:block">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Search..." 
                                        className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all w-48"
                                    />
                                </div>
                                <Link to={isAdmin ? "/admin/notifications" : "/app/notifications"} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors relative">
                                    <Bell size={20} />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
                                </Link>
                                <div className="h-8 w-px bg-slate-100"></div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs font-bold text-slate-900 leading-none">{isAdmin ? 'Admin Operator' : (user?.name || 'User')}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{isAdmin ? 'Full Access' : 'Verified'}</div>
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isAdmin ? "bg-slate-900 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-100 text-emerald-600"}`}>
                                        {isAdmin ? 'AD' : (user?.name?.substring(0, 2).toUpperCase() || 'AZ')}
                                    </div>
                                    <button 
                                        onClick={logout}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center max-w-[400px]">
                                <a href="/#" className={linkBase}>Home</a>
                                <a href="/#services" className={linkBase}>Services</a>
                                <a href="/#features" className={linkBase}>Features</a>
                                <a href="/#security" className={linkBase}>Security</a>
                            </nav>
                            <div className="hidden lg:flex items-center gap-6">
                                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">Login</Link>
                                <Link to="/register" className="bg-emerald-400 hover:bg-emerald-500 text-slate-950 px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/10">
                                    Get Started
                                </Link>
                            </div>
                        </>
                    )}

                    {/* Mobile Controls */}
                    <div className="lg:hidden flex items-center gap-3">
                        {isAuthenticated && (
                            <Link to={isAdmin ? "/admin/notifications" : "/app/notifications"} className="p-2.5 text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
                            </Link>
                        )}
                        <button
                            onClick={() => setOpen((v) => !v)}
                            className="inline-flex items-center justify-center rounded-xl p-2.5 bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                            aria-expanded={open}
                            aria-label="Toggle menu"
                        >
                            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu drawer */}
            <div 
                className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            >
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                    onClick={() => setOpen(false)}
                />
                
                {/* Drawer Content */}
                <div 
                    className={`absolute inset-y-0 left-0 w-[300px] bg-white opacity-100 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${open ? "translate-x-0" : "-translate-x-full"}`}
                    style={{ height: '100dvh', minHeight: '-webkit-fill-available' }}
                >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-20">
                        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                            <div className="w-10 h-10 bg-slate-900 rounded-xl shadow-lg flex items-center justify-center">
                                <img src="/app_store_icon.png" alt="Zantara Logo" className="w-7 h-7" />
                            </div>
                            <span className="text-xl font-black text-slate-900 tracking-tight uppercase">Zantara</span>
                        </Link>
                        <button onClick={() => setOpen(false)} className="p-2.5 -mr-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-8 custom-scrollbar bg-white">
                        {isAuthenticated ? (
                            <div className="space-y-8">
                                {/* Link Tiles */}
                                <nav className="space-y-1.5 text-left">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4 mb-3">Navigation</p>
                                    {!isAdmin ? (
                                        <>
                                            <NavLink to="/app" end className={({ isActive }) => `flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold transition-all ${isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setOpen(false)}>
                                                <LayoutDashboard size={20} />
                                                Dashboard Overview
                                            </NavLink>
                                            <NavLink to="/app/transactions" className={({ isActive }) => `flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold transition-all ${isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setOpen(false)}>
                                                <ListOrdered size={20} />
                                                Transactions History
                                            </NavLink>
                                            <NavLink to="/app/services" className="flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>
                                                <Zap size={20} />
                                                Bill Payments
                                            </NavLink>
                                            <NavLink to="/app/referral" className="flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>
                                                <Users size={20} />
                                                Refer & Earn
                                            </NavLink>
                                            <NavLink to="/app/support" className="flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>
                                                <HelpCircle size={20} />
                                                Contact Support
                                            </NavLink>
                                            <NavLink to="/app/investments" className="flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>
                                                <BarChart3 size={20} />
                                                Investment Portfolio
                                            </NavLink>
                                            <NavLink to="/app/profile" className="flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>
                                                <User size={20} />
                                                Account Security
                                            </NavLink>
                                        </>
                                    ) : (
                                        adminMenuItems.map((item, idx) => {
                                            if (item.header) {
                                                return <p key={idx} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4 mt-6 mb-3">{item.header}</p>
                                            }
                                            return (
                                                <NavLink 
                                                    key={item.path} 
                                                    to={item.path} 
                                                    className={({ isActive }) => `flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold transition-all ${isActive ? "bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20" : "text-slate-400 hover:bg-white/5 hover:text-emerald-400 font-bold"}`} 
                                                    onClick={() => setOpen(false)}
                                                >
                                                    <item.icon size={18} />
                                                    {item.label}
                                                </NavLink>
                                            )
                                        })
                                    )}
                                </nav>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <nav className="space-y-1.5 text-left">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4 mb-3">Quick Navigation</p>
                                    <a href="/#" className="flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>
                                        Home Overview
                                    </a>
                                    <a href="/#services" className="flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>
                                        Our Services
                                    </a>
                                    <a href="/#features" className="flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>
                                        Platform Features
                                    </a>
                                    <a href="/#security" className="flex items-center gap-4 py-3.5 px-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>
                                        Security Measures
                                    </a>
                                </nav>

                                <div className="flex flex-col gap-4 py-6 border-t border-slate-50">
                                    <Link to="/login" className="w-full py-5 rounded-2xl bg-slate-50 text-slate-900 font-black text-center border border-slate-100 active:scale-95 transition-all" onClick={() => setOpen(false)}>Login Account</Link>
                                    <Link to="/register" className="w-full py-5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-center shadow-xl shadow-emerald-500/10 active:scale-95 transition-all text-sm uppercase tracking-widest" onClick={() => setOpen(false)}>Get Started Now</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fixed Logout Button at the bottom */}
                    {isAuthenticated && (
                        <div 
                            className="p-5 border-t border-slate-50 bg-white relative z-50 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.08)]"
                            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 3rem)' }}
                        >
                            <button
                                onClick={() => { setOpen(false); logout(); }}
                                className="w-full py-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 font-bold flex items-center justify-center gap-3 active:scale-95 transition-all text-xs uppercase tracking-widest"
                            >
                                <LogOut size={18} />
                                Logout session
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

