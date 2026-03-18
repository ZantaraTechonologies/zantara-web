// src/pages/buy/PurchaseLayout.tsx
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useWalletStore } from "../../store/wallet/walletStore";
export default function PurchaseLayout({
    title,
    subtitle,
    children,
}: { title: string; subtitle?: string; children: ReactNode }) {
    const { balance, currency, loading, fetchBalance } = useWalletStore();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Link to="/app/wallet" className="inline-flex items-center gap-2 text-emerald-500 font-bold hover:text-emerald-600 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                        <span>Back to Wallet</span>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{title}</h1>
                    {subtitle && <p className="text-slate-500 font-medium">{subtitle}</p>}
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-50 p-6 shadow-sm min-w-[240px]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Protocol</span>
                        <button
                            onClick={() => fetchBalance()}
                            className="text-[10px] font-black uppercase tracking-tighter text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg transition-all"
                            disabled={loading}
                        >
                            {loading ? "Syncing..." : "Refresh"}
                        </button>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter">
                        {currency} {loading ? "—" : balance.toLocaleString()}
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-6 md:p-10">
                {children}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
                <div className="w-5 h-5 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">!</div>
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Payments are processed instantly. Please ensure your phone number and network selection are correct before proceeding, as transactions cannot be reversed.
                </p>
            </div>
        </div>
    );
}
