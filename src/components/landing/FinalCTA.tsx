import React from 'react';
import { Link } from 'react-router-dom';
import { Power, ArrowRight } from 'lucide-react';

const FinalCTA: React.FC = () => {
    return (
        <section className="py-12 md:py-16 bg-gradient-to-b from-brand-mint/60 to-white text-center relative overflow-hidden">
             {/* Radial glow background */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-emerald-100/60 rounded-full blur-[120px] pointer-events-none"></div>

             <div className="mx-auto max-w-4xl px-6 relative z-10 flex flex-col items-center">
                 <div className="w-20 h-20 bg-brand-emerald rounded-3xl flex items-center justify-center text-white mb-10 shadow-btn">
                     <Power className="w-10 h-10" />
                 </div>

                 <h2 className="text-4xl md:text-6xl font-black text-brand-navy tracking-tighter mb-8 leading-[1.05]">
                     Ready to <span className="text-brand-emerald">Power Up?</span>
                 </h2>

                 <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-12">
                     Join thousands of verified users who trust Zantara for their daily digital transactions. Fast, secure, and built for velocity.
                 </p>

                 <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
                     <Link 
                         to="/register" 
                         className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-10 py-5 rounded-[1.5rem] bg-brand-emerald hover:bg-brand-emerald-600 text-white font-black text-sm uppercase tracking-widest transition-transform active:scale-95 shadow-btn"
                     >
                         Create Account <ArrowRight className="w-5 h-5" />
                     </Link>
                     <Link 
                         to="/login" 
                         className="w-full sm:w-auto inline-flex justify-center items-center px-10 py-5 rounded-[1.5rem] border border-brand-navy/20 bg-surface hover:bg-brand-mint hover:border-brand-emerald/40 text-brand-navy font-black text-sm uppercase tracking-widest transition-transform active:scale-95"
                     >
                         Log In to Dashboard
                     </Link>
                 </div>

                 <p className="mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                     No hidden fees • Instant Activation
                 </p>
             </div>
        </section>
    );
};

export default FinalCTA;
