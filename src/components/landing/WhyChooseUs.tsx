import React from 'react';
import { Shield, FastForward, Receipt, Layout, Gift, Activity } from 'lucide-react';

const features = [
    {
        title: "Secure Wallet System",
        desc: "Your funds are protected with industry-standard AES-256 encryption and compliance-grade security protocols.",
        icon: Shield,
    },
    {
        title: "Fast Transactions",
        desc: "Automated fulfillment engines process your requests in milliseconds. Experience zero delay on all services.",
        icon: FastForward,
    },
    {
        title: "Transparent Pricing",
        desc: "We believe in honest rates. Wholesale pricing is displayed upfront with absolutely zero hidden charges.",
        icon: Receipt,
    },
    {
        title: "Easy-to-use Platform",
        desc: "An intuitive interface designed to make your digital payments and purchases as simple as a few clicks.",
        icon: Layout,
    },
    {
        title: "Referral Rewards",
        desc: "Earn passive income by inviting friends to the platform. Grow your network and multiply your wallet balance.",
        icon: Gift,
    },
    {
        title: "Transaction Tracking",
        desc: "Detailed ledger records and real-time receipts for every transaction ensure complete accountability.",
        icon: Activity,
    }
];

const WhyChooseUs: React.FC = () => {
    return (
        <section id="features" className="py-12 md:py-16 bg-brand-mint/40 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-brand-emerald-100 rounded-full blur-[120px] -z-10 opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
             
             <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                    <div className="max-w-2xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-emerald">The Zantara Advantage</span>
                        <h2 className="mt-4 text-4xl md:text-5xl font-black text-brand-navy tracking-tighter">Why Choose Us?</h2>
                        <p className="mt-6 text-lg text-slate-500 font-medium leading-relaxed">
                            We don't just process transactions; we build robust, scalable financial pathways that businesses and individuals trust daily.
                        </p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((item, idx) => (
                        <div key={idx} className="group p-2 flex flex-col items-start">
                            <div className="w-12 h-12 rounded-xl bg-surface border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:bg-brand-mint group-hover:border-brand-emerald/30 group-hover:scale-110 transition-all duration-300">
                                <item.icon className="w-6 h-6 text-brand-navy group-hover:text-brand-emerald transition-colors duration-300" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-navy mb-3 tracking-tight group-hover:text-brand-emerald transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
