import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Wifi, Tv, Zap, BookOpen, Wallet } from 'lucide-react';

const services = [
    {
        title: 'Airtime Recharge',
        description: 'Instant recharge for MTN, Airtel, Glo, and 9Mobile networks with zero hidden charges.',
        icon: Smartphone,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        hoverBorder: 'hover:border-blue-500/30'
    },
    {
        title: 'Data Subscriptions',
        description: 'Cheap and affordable data bundles ranging from Daily to SME corporate plans.',
        icon: Wifi,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        hoverBorder: 'hover:border-emerald-500/30'
    },
    {
        title: 'Electricity Bills',
        description: 'Pay your prepaid and postpaid electricity bills instantly. 11+ DisCos supported.',
        icon: Zap,
        color: 'text-yellow-500',
        bg: 'bg-yellow-50',
        hoverBorder: 'hover:border-yellow-500/30'
    },
    {
        title: 'Cable TV Subs',
        description: 'Never miss a show. Renew your DSTV, GOTV, and Startimes subscriptions automatically.',
        icon: Tv,
        color: 'text-purple-500',
        bg: 'bg-purple-50',
        hoverBorder: 'hover:border-purple-500/30'
    },
    {
        title: 'Exam PINs',
        description: 'Generate WAEC, NECO, NABTEB, and JAMB result checking PINs directly to your email.',
        icon: BookOpen,
        color: 'text-rose-500',
        bg: 'bg-rose-50',
        hoverBorder: 'hover:border-rose-500/30'
    },
    {
        title: 'Secure Wallet',
        description: 'Automated virtual accounts for instant funding and seamless wallet-to-wallet transfers.',
        icon: Wallet,
        color: 'text-slate-900',
        bg: 'bg-slate-100',
        hoverBorder: 'hover:border-slate-500/30'
    }
];

const ServicesGrid: React.FC = () => {
    return (
        <section className="py-12 md:py-16 bg-slate-50/50">
            <div className="mx-auto max-w-7xl px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Core Infrastructure</span>
                    <h2 className="mt-4 text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Everything You Need.</h2>
                    <p className="mt-4 text-lg text-slate-500 font-medium leading-relaxed">
                        Access a full suite of digital financial services through a single, secure, and blazing-fast interface.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, idx) => (
                        <Link 
                            to="/login"
                            key={idx}
                            className={`bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group block ${service.hoverBorder} transform hover:-translate-y-1`}
                        >
                            <div className={`w-14 h-14 ${service.bg} ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <service.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-emerald-600 transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                {service.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesGrid;
