// src/components/wallet/QuickActions.tsx
import { Link } from "react-router-dom";
import { Wifi, Smartphone, Tv, FileText, ChevronRight, Users } from "lucide-react";

export default function QuickActions() {
    const actions = [
        {
            name: "Buy Data",
            description: "Data Bundles",
            icon: <Wifi className="w-5 h-5 text-emerald-500" />,
            to: "/buy/data",
        },
        {
            name: "Buy Airtime",
            description: "Talk Time",
            icon: <Smartphone className="w-5 h-5 text-emerald-500" />,
            to: "/buy/airtime",
        },
        {
            name: "Cable TV",
            description: "Entertainment",
            icon: <Tv className="w-5 h-5 text-emerald-500" />,
            to: "/buy/cable",
        },
        {
            name: "Exam PINs",
            description: "Education",
            icon: <FileText className="w-5 h-5 text-emerald-500" />,
            to: "/buy/pin",
        },
        {
            name: "Refer & Earn",
            description: "Grow Network",
            icon: <Users className="w-5 h-5 text-emerald-500" />,
            to: "/referral",
        },
    ];

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">Quick actions</h2>
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {actions.map((action) => (
                        <Link
                            key={action.name}
                            to={action.to}
                            className="group rounded-[1.5rem] border border-slate-50 bg-white p-5 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center transition-transform group-hover:scale-110">
                                    {action.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-900 tracking-tight">{action.name}</div>
                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{action.description}</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
