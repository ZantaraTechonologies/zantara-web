import React from 'react';

export const CardSkeleton = () => (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 animate-pulse space-y-4">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <div className="w-24 h-2 bg-white/10 rounded"></div>
                <div className="w-32 h-6 bg-white/10 rounded"></div>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-xl"></div>
        </div>
        <div className="pt-4 border-t border-white/5 flex gap-4">
            <div className="w-20 h-3 bg-white/10 rounded"></div>
            <div className="w-20 h-3 bg-white/10 rounded"></div>
        </div>
    </div>
);

export const ListSkeleton = ({ items = 3, count }: { items?: number, count?: number }) => {
    const finalItems = count || items;
    return (
        <div className="space-y-4">
            {Array.from({ length: finalItems }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl"></div>
                        <div className="space-y-2">
                            <div className="w-32 h-3 bg-white/5 rounded"></div>
                            <div className="w-20 h-2 bg-white/5 rounded"></div>
                        </div>
                    </div>
                    <div className="w-16 h-4 bg-white/5 rounded"></div>
                </div>
            ))}
        </div>
    );
};

export const ServiceSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
                <div className="w-20 h-2 bg-slate-100 rounded uppercase"></div>
                <div className="w-full h-12 bg-slate-50 rounded-xl"></div>
            </div>
            <div className="space-y-2">
                <div className="w-20 h-2 bg-slate-100 rounded uppercase"></div>
                <div className="w-full h-12 bg-slate-50 rounded-xl"></div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="w-32 h-2 bg-slate-100 rounded uppercase"></div>
            <div className="w-full h-12 bg-slate-50 rounded-xl"></div>
        </div>
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="space-y-2">
                <div className="w-16 h-2 bg-slate-100 rounded"></div>
                <div className="w-24 h-6 bg-slate-100 rounded"></div>
            </div>
            <div className="w-32 h-12 bg-slate-100 rounded-xl"></div>
        </div>
    </div>
);

export const PageLoader = () => (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-6">
        <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center shadow-2xl">
                <div className="w-8 h-8 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin"></div>
            </div>
        </div>
        <div className="text-center space-y-1">
            <p className="text-slate-900 font-bold text-sm tracking-tight">Loading your dashboard</p>
            <p className="text-slate-400 text-xs font-medium">Syncing your account...</p>
        </div>
        <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    </div>
);
