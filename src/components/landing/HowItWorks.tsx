import React from 'react';
import { UserPlus, Wallet, Sparkles } from 'lucide-react';
import { useSiteSettings } from '../../app/SiteSettingsContext';

const steps = [
    {
        icon: UserPlus,
        title: "Create Account",
        desc: "Sign up in seconds. All you need is your email and phone number to get started on the platform.",
        step: "01"
    },
    {
        icon: Wallet,
        title: "Fund Wallet",
        desc: "Receive an instant virtual account. Deposit funds using Bank Transfer or Card payments easily.",
        step: "02"
    },
    {
        icon: Sparkles,
        title: "Start Paying",
        desc: "Use your secure wallet balance to purchase airtime, data, exams PINs or settle utility bills globally.",
        step: "03"
    }
];

const HowItWorks: React.FC = () => {
    const { settings } = useSiteSettings();

    return (
        <section id="how-it-works" className="py-12 md:py-16 bg-surface relative overflow-hidden">
             <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-emerald">Simple Mechanics</span>
                    <h2 className="mt-4 text-4xl md:text-5xl font-black text-brand-navy tracking-tighter">How {settings.SITE_NAME} Works</h2>
                    <p className="mt-4 text-lg text-slate-500 font-medium leading-relaxed">
                        Say goodbye to complex onboarding. Jump straight into the action with our frictionless three-step process.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((item, idx) => (
                        <div key={idx} className="relative flex flex-col items-center text-center group">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-[2rem] bg-brand-mint border border-brand-emerald/20 flex items-center justify-center group-hover:bg-surface group-hover:border-brand-emerald/40 group-hover:shadow-card transition-all duration-300">
                                    <item.icon className="w-10 h-10 text-brand-emerald group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-emerald text-white flex items-center justify-center text-xs font-black shadow-btn">
                                    {item.step}
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-brand-navy mb-4 tracking-tight">
                                {item.title}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
