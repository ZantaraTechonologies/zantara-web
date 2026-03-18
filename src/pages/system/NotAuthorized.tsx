import { ShieldAlert, Home, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotAuthorized({ requiredRoles = ["admin"] }: { requiredRoles?: string[] }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-lg w-full">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-rose-200 blur-3xl opacity-30 rounded-full scale-150 animate-pulse" />
                    <div className="relative bg-white rounded-full p-8 shadow-xl shadow-rose-100 border border-slate-100">
                        <ShieldAlert className="w-16 h-16 text-rose-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        You’re signed in, but your account doesn’t have the required permissions to access this area. 
                        Required roles: <span className="text-rose-600 font-bold px-2 py-0.5 bg-rose-50 rounded-lg">{requiredRoles.join(", ")}</span>
                    </p>
                </div>

                <div className="pt-4 flex items-center justify-center gap-4 flex-col sm:flex-row">
                    <Link
                        to="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        <span>Go back home</span>
                    </Link>
                    <Link
                        to="/admin/logout"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                    </Link>
                </div>

                <div className="pt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100/50">
                    <p className="text-xs text-amber-800 font-bold uppercase tracking-widest mb-2">Notice</p>
                    <p className="text-sm text-amber-700 leading-relaxed font-medium">
                        If you believe this is an error, please contact your system administrator to update your account privileges.
                    </p>
                </div>
            </div>
        </div>
    );
}
