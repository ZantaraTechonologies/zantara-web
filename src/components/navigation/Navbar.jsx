// src/components/navigation/Navbar.jsx
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth/authStore";
import { PhoneCall, Lock, LogOut, Menu, X, LayoutDashboard, Bell, Search } from "lucide-react";

export default function Navbar() {
    const { isAuthenticated, logout, user } = useAuthStore();
    const [open, setOpen] = useState(false);

    const linkBase = "inline-flex items-center text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors";
    const btnBase = "inline-flex items-center gap-2 rounded-xl px-4 py-2 transition-all font-bold text-sm shadow-sm";

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center">
            <div className="mx-auto max-w-7xl w-full px-6 sm:px-12">
                <div className="flex items-center justify-between gap-8">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/app_store_icon.png" alt="Zantara Logo" className="w-8 h-8 rounded-lg shadow-lg" />
                        <span className="text-xl font-bold text-slate-900 tracking-tight uppercase">Zantara</span>
                    </Link>

                    {/* Desktop nav (Conditional) */}
                    {isAuthenticated ? (
                        <div className="hidden lg:flex flex-1 items-center justify-between">
                            <nav className="flex items-center gap-8 ml-8">
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
                                    to="/app/wallet"
                                    className={({ isActive }) =>
                                        `${linkBase} ${isActive ? "text-emerald-600" : ""}`
                                    }
                                >
                                    Wallet
                                </NavLink>
                                <NavLink
                                    to="/app/transactions"
                                    className={({ isActive }) =>
                                        `${linkBase} ${isActive ? "text-emerald-600" : ""}`
                                    }
                                >
                                    Transactions
                                </NavLink>
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
                                <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors relative">
                                    <Bell size={20} />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></span>
                                </button>
                                <div className="h-8 w-px bg-slate-100"></div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'User'}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Verified</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xs">
                                        {user?.name?.substring(0, 2).toUpperCase() || 'AZ'}
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

            {/* Mobile menu */}
            {open && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-2xl animate-in slide-in-from-top duration-300">
                    <div className="p-6 space-y-4">
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/app" end className="block py-3 px-4 rounded-xl text-slate-600 font-bold hover:bg-slate-50">Dashboard</NavLink>
                                <NavLink to="/app/wallet" className="block py-3 px-4 rounded-xl text-slate-600 font-bold hover:bg-slate-50">Wallet</NavLink>
                                <NavLink to="/app/transactions" className="block py-3 px-4 rounded-xl text-slate-600 font-bold hover:bg-slate-50">Transactions</NavLink>
                                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                                    <button
                                        onClick={() => { setOpen(false); logout(); }}
                                        className="w-full py-4 rounded-xl bg-red-50 text-red-600 font-extrabold flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link to="/login" className="w-full py-4 rounded-xl bg-slate-50 text-slate-600 font-extrabold text-center">Login</Link>
                                <Link to="/register" className="w-full py-4 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-center shadow-lg shadow-emerald-500/20">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

