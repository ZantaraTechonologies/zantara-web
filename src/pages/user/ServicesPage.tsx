import React from 'react';
import { 
    Zap, 
    Wifi, 
    Tv, 
    GraduationCap, 
    Gamepad2, 
    ChevronRight,
    Search,
    Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesPage: React.FC = () => {
    const services = [
        { 
            id: 'airtime', 
            label: 'Airtime Top-up', 
            description: 'Instant credit for all major networks',
            icon: Zap, 
            path: '/app/services/airtime', 
            color: 'bg-orange-50 text-orange-600',
            borderColor: 'border-orange-100'
        },
        { 
            id: 'data', 
            label: 'Data Bundles', 
            description: 'Affordable internet for your devices',
            icon: Wifi, 
            path: '/app/services/data', 
            color: 'bg-blue-50 text-blue-600',
            borderColor: 'border-blue-100'
        },
        { 
            id: 'cable', 
            label: 'Cable TV', 
            description: 'DStv, GOtv, and Startimes renewals',
            icon: Tv, 
            path: '/app/services/cable', 
            color: 'bg-purple-50 text-purple-600',
            borderColor: 'border-purple-100'
        },
        { 
            id: 'electricity', 
            label: 'Electricity', 
            description: 'Pay utility bills across all DISCOs',
            icon: Zap, 
            path: '/app/services/electricity', 
            color: 'bg-yellow-50 text-yellow-600',
            borderColor: 'border-yellow-100'
        },
        { 
            id: 'exam', 
            label: 'Education PINs', 
            description: 'WAEC, NECO, and JAMB result checkers',
            icon: GraduationCap, 
            path: '/app/services/exam-pins', 
            color: 'bg-red-50 text-red-600',
            borderColor: 'border-red-100'
        },
    ];

    return (
        <div className="p-6 sm:p-8 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Services Hub</h1>
                    <p className="text-slate-500 font-medium">Select a utility or service to deploy on your node.</p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search services..." 
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <Link 
                        key={service.id} 
                        to={service.path}
                        className={`group bg-white border ${service.borderColor} p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all active:scale-[0.98] duration-300 relative overflow-hidden`}
                    >
                        {/* Subtle background glow on hover */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-8 -mt-8"></div>
                        
                        <div className="flex items-center gap-5">
                            <div className={`${service.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                <service.icon size={26} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{service.label}</h3>
                                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Featured Notice */}
            <div className="bg-slate-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                            <Info size={12} />
                            <span>System Note</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Need custom service integrations?</h2>
                        <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                            Our node protocol is expanding. If you're a high-volume agent or merchant requiring enterprise API access, contact our technical support team for specialized routing.
                        </p>
                    </div>
                    <Link to="/app/support" className="inline-flex items-center justify-center px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                        Contact Protocol Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
