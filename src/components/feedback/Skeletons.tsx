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
                <div className="w-20 h-2 bg-white/10 rounded uppercase"></div>
                <div className="w-full h-12 bg-white/5 rounded-xl"></div>
            </div>
            <div className="space-y-2">
                <div className="w-20 h-2 bg-white/10 rounded uppercase"></div>
                <div className="w-full h-12 bg-white/5 rounded-xl"></div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="w-32 h-2 bg-white/10 rounded uppercase"></div>
            <div className="w-full h-12 bg-white/5 rounded-xl"></div>
        </div>
        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="space-y-2">
                <div className="w-16 h-2 bg-white/10 rounded"></div>
                <div className="w-24 h-6 bg-white/10 rounded"></div>
            </div>
            <div className="w-32 h-12 bg-white/10 rounded-xl"></div>
        </div>
    </div>
);
