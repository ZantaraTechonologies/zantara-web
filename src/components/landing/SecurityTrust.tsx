import React from 'react';
import { ShieldCheck, Fingerprint, Lock, CheckCircle2 } from 'lucide-react';

const trustFeatures = [
    {
        title: "Verified KYC Compliance",
        description: "Our multi-tiered verification process ensures every user on the platform is verified, guaranteeing a safe, authentic trading environment.",
        icon: Fingerprint
    },
    {
        title: "Full Transaction Traceability",
        description: "Generate irrefutable receipts with unique tracking IDs. Every transfer, purchase, and settlement is perfectly logged in your private ledger.",
        icon: CheckCircle2
    },
    {
        title: "Account Security",
        description: "With mandatory Transaction PINs and JWT token-based session management, your wallet balances remain unreachable to unauthorized parties.",
        icon: Lock
    }
];

const SecurityTrust: React.FC = () => {
    return (
        <section id="security" className="py-12 md:py-16 bg-surface relative border-t border-slate-100">
             <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-16 items-center">
                 {/* Left Side: Security Graphic */}
                 <div className="order-2 md:order-1 relative">
                     <div className="absolute inset-0 bg-brand-mint rounded-full blur-[100px] -z-10"></div>
                     <div className="relative bg-surface rounded-[3rem] p-10 border border-slate-100 shadow-card flex flex-col items-center text-center">
                         <div className="w-24 h-24 bg-brand-mint rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-lg animate-pulse">
                             <ShieldCheck className="w-12 h-12 text-brand-emerald" />
                         </div>
                         <h3 className="text-2xl font-black text-brand-navy tracking-tighter mb-4">Uncompromised Security</h3>
                         <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs">
                             Zantara utilizes industrial-standard encryption and strict KYC procedures to keep you completely safe.
                         </p>
                          
                         <div className="w-full mt-10 space-y-4">
                             <div className="p-4 rounded-xl bg-brand-mint/60 flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-full bg-brand-emerald text-white flex items-center justify-center shrink-0">
                                     <Lock className="w-4 h-4" />
                                 </div>
                                 <div className="flex-1">
                                     <div className="h-2 w-3/4 bg-surface rounded-full mb-2"></div>
                                     <div className="h-2 w-1/2 bg-brand-emerald-200 rounded-full"></div>
                                 </div>
                             </div>
                             <div className="p-4 rounded-xl bg-brand-mint/60 flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-full bg-brand-emerald text-white flex items-center justify-center shrink-0">
                                     <Fingerprint className="w-4 h-4" />
                                 </div>
                                 <div className="flex-1">
                                     <div className="h-2 w-full bg-surface rounded-full mb-2"></div>
                                     <div className="h-2 w-2/3 bg-brand-emerald-200 rounded-full"></div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Right Side: Text Highlights */}
                 <div className="order-1 md:order-2">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-emerald">Credibility & Trust</span>
                     <h2 className="mt-4 text-4xl md:text-5xl font-black text-brand-navy tracking-tighter mb-6">Designed with your safety in mind.</h2>
                     <p className="text-lg text-slate-500 font-medium leading-relaxed mb-12">
                         At Zantara, preserving the integrity of your funds is our highest priority. We deploy cutting-edge anti-fraud systems to ensure true peace of mind.
                     </p>

                     <div className="space-y-10">
                         {trustFeatures.map((feature, idx) => (
                             <div key={idx} className="flex gap-5 group">
                                 <div className="w-12 h-12 bg-brand-mint rounded-xl border border-brand-emerald/20 flex items-center justify-center shrink-0 group-hover:border-brand-emerald/40 group-hover:shadow-brand-emerald/10 transition-all">
                                     <feature.icon className="w-5 h-5 text-brand-emerald" />
                                 </div>
                                 <div>
                                     <h4 className="text-lg font-bold text-brand-navy mb-2">{feature.title}</h4>
                                     <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.description}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        </section>
    );
};

export default SecurityTrust;
