import React from 'react';

export const CardSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl border border-slate-50 animate-pulse space-y-4">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <div className="w-24 h-2 bg-slate-100 rounded"></div>
                <div className="w-32 h-6 bg-slate-100 rounded"></div>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-xl"></div>
        </div>
        <div className="pt-4 border-t border-slate-50 flex gap-4">
            <div className="w-20 h-3 bg-slate-50 rounded"></div>
            <div className="w-20 h-3 bg-slate-50 rounded"></div>
        </div>
    </div>
);

export const ListSkeleton = ({ items = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                    <div className="space-y-2">
                        <div className="w-32 h-3 bg-slate-100 rounded"></div>
                        <div className="w-20 h-2 bg-slate-50 rounded"></div>
                    </div>
                </div>
                <div className="w-16 h-4 bg-slate-100 rounded"></div>
            </div>
        ))}
    </div>
);

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
        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="space-y-2">
                <div className="w-16 h-2 bg-slate-100 rounded"></div>
                <div className="w-24 h-6 bg-slate-100 rounded"></div>
            </div>
            <div className="w-32 h-12 bg-slate-100 rounded-xl"></div>
        </div>
    </div>
);
