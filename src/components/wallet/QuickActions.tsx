// src/components/wallet/QuickActions.tsx
import { Link } from "react-router-dom";
import { Wifi, Smartphone, Tv, FileText, ChevronRight, Users } from "lucide-react";

export default function QuickActions() {
    const actions = [
        {
            name: "Buy Data",
            description: "MTN, Airtel, Glo, 9mobile",
            icon: <Wifi className="w-5 h-5 text-sky-600" />,
            to: "/buy/data",
        },
        {
            name: "Buy Airtime",
            description: "All networks supported",
            icon: <Smartphone className="w-5 h-5 text-sky-600" />,
            to: "/buy/airtime",
        },
        {
            name: "Cable TV",
            description: "DSTV, GOtv, Startimes",
            icon: <Tv className="w-5 h-5 text-sky-600" />,
            to: "/buy/cable",
        },
        {
            name: "Exam PINs",
            description: "WAEC, NECO, JAMB, NBAIS",
            icon: <FileText className="w-5 h-5 text-sky-600" />,
            to: "/buy/pin",
        },
        {
            name: "Refer & Earn",
            description: "Invite friends",
            icon: <Users className="w-5 h-5 text-sky-600" />,
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
                            className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-sky-300 hover:shadow transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                                    {action.icon}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">{action.name}</div>
                                    <div className="text-xs text-slate-500">{action.description}</div>
                                </div>
                                <ChevronRight className="ml-auto w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
