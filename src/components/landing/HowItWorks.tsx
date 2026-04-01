import React from 'react';
import { UserPlus, Wallet, Sparkles } from 'lucide-react';

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
    return (
        <section id="how-it-works" className="py-12 md:py-16 bg-slate-950 text-white relative overflow-hidden">
             {/* Abstract curves for background */}
             <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-emerald-500 fill-current">
                    <path d="M0,50 C30,120 70,-20 100,50 L100,100 L0,100 Z" />
                </svg>
             </div>

             <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Simple Mechanics</span>
                    <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tighter">How Zantara Works</h2>
                    <p className="mt-4 text-lg text-slate-400 font-medium leading-relaxed">
                        Say goodbye to complex onboarding. Jump straight into the action with our frictionless three-step process.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Horizontal connector line on desktop */}
                    <div className="hidden md:block absolute top-[4.5rem] left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-slate-800 via-emerald-500/50 to-slate-800 z-0 border-dashed border-t-2 border-slate-700/50"></div>

                    {steps.map((item, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-300">
                                    <item.icon className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-lg">
                                    {item.step}
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">
                                {item.title}
                            </h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
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
