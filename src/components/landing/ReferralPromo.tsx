import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, ArrowRight, Share2, PhilippinePeso, Users } from 'lucide-react';

const ReferralPromo: React.FC = () => {
    return (
        <section className="py-12 md:py-16 bg-surface">
            <div className="mx-auto max-w-7xl px-6">
                <div className="rounded-[3rem] bg-gradient-to-tr from-brand-navy to-brand-navy-600 overflow-hidden relative shadow-2xl shadow-brand-navy/20">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-emerald rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none opacity-30"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-emerald-700 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none opacity-30"></div>
                    
                    <div className="grid lg:grid-cols-2 items-center gap-12 p-10 md:p-16 lg:p-20 relative z-10">
                        {/* Text Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-emerald/20 border border-brand-emerald/40 mb-8 backdrop-blur-md">
                                <Gift className="w-4 h-4 text-brand-emerald" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-emerald">Zantara Rewards Program</span>
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
                                Invite friends and earn continuous rewards.
                            </h2>
                            
                            <p className="text-white/70 text-lg font-medium leading-relaxed mb-10 max-w-lg">
                                When you bring your network to Zantara, we reward your growth. Earn a percentage bonus across our massive ecosystem every time your referrals make a transaction.
                            </p>
                            
                            <Link 
                                to="/register" 
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-brand-emerald hover:bg-brand-emerald-600 text-white font-black uppercase tracking-widest text-xs transition-transform active:scale-95 shadow-btn"
                            >
                                Get Started Now <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        {/* Visual Node representation */}
                        <div className="relative flex justify-center lg:justify-end">
                            <div className="relative w-full max-w-[360px] aspect-square">
                                {/* Center Node */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-surface rounded-full shadow-2xl flex items-center justify-center z-20">
                                    <div className="w-16 h-16 bg-brand-mint rounded-full flex items-center justify-center text-brand-emerald font-bold border border-brand-emerald/30">YOU</div>
                                </div>
                                
                                {/* Orbiting Nodes */}
                                <div className="absolute inset-0 border-2 border-dashed border-brand-emerald/30 rounded-full animate-[spin_20s_linear_infinite]">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-surface rounded-full flex items-center justify-center text-brand-emerald shadow-xl border border-brand-emerald/20">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="absolute bottom-1/4 -right-8 w-14 h-14 bg-surface rounded-full flex items-center justify-center text-brand-emerald shadow-xl">
                                        <Share2 className="w-5 h-5" />
                                    </div>
                                    <div className="absolute bottom-1/4 -left-8 w-14 h-14 bg-surface rounded-full flex items-center justify-center text-brand-emerald shadow-xl">
                                        <PhilippinePeso className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReferralPromo;
