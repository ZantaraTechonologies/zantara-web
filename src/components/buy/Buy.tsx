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
            className={`h-10 rounded-xl border border-slate-200 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium text-sm ${props.className ?? ""}`}
        />
    );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            {...props}
            className={`h-10 rounded-xl border border-slate-200 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium text-sm ${props.className ?? ""}`}
        />
    );
}

export function SubmitButton({ loading, disabled, children }: { loading?: boolean; disabled?: boolean; children: ReactNode }) {
    return (
        <button
            type="submit"
            disabled={disabled || loading}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-400 px-8 font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 disabled:opacity-60 transition-all active:scale-[0.98] text-sm"
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
            ) : children}
        </button>
    );
}
