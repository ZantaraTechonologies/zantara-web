import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth/authStore";
import { LogOut, Menu, X, LayoutDashboard, Bell, Search, Users, ShieldCheck, ListOrdered, Banknote, MessageSquare, Activity, Zap, CreditCard, User, ArrowUpRight } from "lucide-react";

export default function Navbar() {
    const { isAuthenticated, logout, user } = useAuthStore();
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const isAdmin = location.pathname.startsWith('/admin');

    const linkBase = "inline-flex items-center text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors";

    const adminMenuItems = [
        { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/admin/users", label: "Users", icon: Users },
        { path: "/admin/kyc", label: "KYC", icon: ShieldCheck },
        { path: "/admin/transactions", label: "Transactions", icon: ListOrdered },
        { path: "/admin/withdrawals", label: "Withdrawals", icon: Banknote },
        { path: "/admin/support", label: "Support", icon: MessageSquare },
        { path: "/admin/status", label: "System", icon: Activity },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center">
            <div className="mx-auto max-w-7xl w-full px-6 sm:px-12">
                <div className="flex items-center justify-between gap-8">
                    {/* Brand */}
                    <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-3">
                        <img src="/app_store_icon.png" alt="Zantara Logo" className="w-8 h-8 rounded-lg shadow-lg" />
                        <span className="text-xl font-bold text-slate-900 tracking-tight uppercase">Zantara {isAdmin && <span className="text-emerald-500 ml-1">Admin</span>}</span>
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
                                <Link to={isAdmin ? "/admin/notifications" : "/app/profile/notifications"} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors relative">
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
                        <div className="hidden lg:flex items-center gap-8">
                            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">Login</Link>
                            <Link to="/register" className="bg-emerald-400 hover:bg-emerald-500 text-slate-950 px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/10">
                                Get Started
                            </Link>
                        </div>
                    )}

                    {/* Mobile burger */}
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="lg:hidden inline-flex items-center justify-center rounded-xl p-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-expanded={open}
                        aria-label="Toggle menu"
                    >
                        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu drawer */}
            <div 
                className={`lg:hidden fixed inset-0 z-[100] transition-visibility duration-300 ${open ? "visible" : "invisible"}`}
            >
                {/* Backdrop */}
                <div 
                    className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
                    onClick={() => setOpen(false)}
                />
                
                {/* Drawer Content */}
                <div 
                    className={`absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${open ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                            <img src="/app_store_icon.png" alt="Zantara Logo" className="w-8 h-8 rounded-lg shadow-lg" />
                            <span className="text-lg font-bold text-slate-900 tracking-tight uppercase">Zantara {isAdmin && <span className="text-emerald-500 ml-1">Admin</span>}</span>
                        </Link>
                        <button onClick={() => setOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                        {isAuthenticated ? (
                            <>
                                <div className={`mb-6 p-4 rounded-2xl border ${isAdmin ? "bg-slate-900 border-emerald-500/20" : "bg-emerald-50 border-emerald-100/50"}`}>
                                    <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] mb-1 ${isAdmin ? "text-emerald-400" : "text-emerald-600"}`}>{isAdmin ? "Admin Console" : "Signed in as"}</div>
                                    <div className={`font-bold truncate text-sm ${isAdmin ? "text-white" : "text-slate-900"}`}>{isAdmin ? "System Administrator" : (user?.name || 'User')}</div>
                                    {!isAdmin && <div className="text-slate-400 text-[11px] font-medium truncate mt-1">{user?.email}</div>}
                                </div>
                                
                                {!isAdmin ? (
                                    <>
                                        <NavLink to="/app" end className={({ isActive }) => `block py-3 px-4 rounded-xl font-bold transition-all ${isActive ? "bg-slate-950 text-emerald-400 shadow-lg" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setOpen(false)}>Dashboard Overview</NavLink>
                                        <NavLink to="/app/transactions" className={({ isActive }) => `block py-3 px-4 rounded-xl font-bold transition-all ${isActive ? "bg-slate-950 text-emerald-400 shadow-lg" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setOpen(false)}>Transactions History</NavLink>
                                        <NavLink to="/app/services" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>All Services</NavLink>
                                        <NavLink to="/app/profile" className="block py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>My Profile</NavLink>
                                    </>
                                ) : (
                                    adminMenuItems.map((item) => (
                                        <NavLink 
                                            key={item.path} 
                                            to={item.path} 
                                            className={({ isActive }) => `flex items-center gap-3 py-3 px-4 rounded-xl font-bold transition-all ${isActive ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-600 hover:bg-slate-50"}`} 
                                            onClick={() => setOpen(false)}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                        </NavLink>
                                    ))
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link to="/login" className="w-full py-4 rounded-xl bg-slate-50 text-slate-600 font-extrabold text-center" onClick={() => setOpen(false)}>Login</Link>
                                <Link to="/register" className="w-full py-4 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-center shadow-lg shadow-emerald-500/20" onClick={() => setOpen(false)}>Get Started</Link>
                            </div>
                        )}
                    </div>

                    {isAuthenticated && (
                        <div className="p-6 border-t border-slate-100">
                            <button
                                onClick={() => { setOpen(false); logout(); }}
                                className="w-full py-4 rounded-xl bg-red-50 text-red-600 font-extrabold flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                {isAdmin ? "Terminate Admin Session" : "Logout Session"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
