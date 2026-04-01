// src/pages/buy/components.tsx
import { ReactNode } from "react";

export function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            {children}
        </label>
    );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`h-11 rounded-xl border-2 border-slate-100 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all font-semibold text-sm shadow-sm ${props.className ?? ""}`}
        />
    );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            {...props}
            className={`h-11 rounded-xl border-2 border-slate-100 bg-slate-50 px-4 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all font-semibold text-sm shadow-sm cursor-pointer ${props.className ?? ""}`}
        />
    );
}

export function SubmitButton({ loading, disabled, children, onClick }: { loading?: boolean; disabled?: boolean; children: ReactNode; onClick?: () => void }) {
    return (
        <button
            type={onClick ? "button" : "submit"}
            onClick={onClick}
            disabled={disabled || loading}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-500 px-10 font-black text-slate-950 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:hover:translate-y-0 transition-all duration-300 text-sm uppercase tracking-wider"
        >
            {loading ? (
                <div className="w-5 h-5 border-[3px] border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
            ) : children}
        </button>
    );
}
