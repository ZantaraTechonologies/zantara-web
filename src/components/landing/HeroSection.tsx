import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wallet, Zap, Shield, Smartphone } from 'lucide-react';

const HeroSection: React.FC = () => {
    return (
        <section className="relative overflow-hidden pt-4 pb-12 md:pt-10 md:pb-16 bg-surface">
            <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
                {/* Left side content */}
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-mint border border-brand-emerald/20 mb-8 animate-in slide-in-from-bottom-4 duration-700 fade-in">
                        <span className="flex h-2 w-2 rounded-full bg-brand-emerald animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-emerald">The Modern Financial Gateway</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-5xl font-black text-brand-navy tracking-tighter leading-[1.05] animate-in slide-in-from-bottom-6 duration-700 delay-150 fade-in">
                        Fast, Secure, and <span className="text-brand-emerald">Reliable</span> Digital Payments
                    </h1>

                    <p className="mt-8 text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-lg animate-in slide-in-from-bottom-8 duration-700 delay-300 fade-in">
                        Fund your wallet instantly. Purchase airtime, data, pay utility bills, and buy exam PINs seamlessly with bank-grade security and zero delays.
                    </p>

                    <div className="mt-12 flex flex-col sm:flex-row items-center gap-5 animate-in slide-in-from-bottom-10 duration-700 delay-500 fade-in">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-2xl bg-brand-emerald hover:bg-brand-emerald-600 text-white font-black text-sm uppercase tracking-wider transition-all shadow-btn active:scale-95"
                        >
                            Create Account <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-2xl bg-brand-mint hover:bg-brand-emerald-50 border border-brand-emerald/20 text-brand-navy font-black text-sm uppercase tracking-wider transition-all active:scale-95"
                        >
                            Log In
                        </Link>
                    </div>

                    <div className="mt-14 flex items-center gap-6 text-sm font-medium text-slate-400 animate-in slide-in-from-bottom-12 duration-700 delay-700 fade-in">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-brand-mint border-2 border-white flex items-center justify-center text-brand-emerald text-xs font-bold">AS</div>
                            <div className="w-10 h-10 rounded-full bg-brand-mint border-2 border-white flex items-center justify-center text-brand-emerald text-xs font-bold">BK</div>
                            <div className="w-10 h-10 rounded-full bg-brand-mint border-2 border-white flex items-center justify-center text-brand-emerald text-xs font-bold">CN</div>
                            <div className="w-10 h-10 rounded-full bg-brand-navy border-2 border-white flex items-center justify-center text-white text-[10px] font-black tracking-tighter">10k+</div>
                        </div>
                        <p>Trusted by over <strong className="text-brand-navy">10,000+</strong> users</p>
                    </div>
                </div>

                {/* Right side conceptual illustration */}
                <div className="relative z-10 hidden lg:block animate-in zoom-in-95 duration-1000 delay-300 fade-in">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-emerald-100/40 to-slate-100/40 rounded-full blur-3xl -z-10 transform scale-150"></div>

                    <div className="relative max-w-md mx-auto">
                        {/* Main Dashboard Card */}
                        <div className="relative z-20 bg-surface rounded-[2.5rem] p-8 shadow-card-hover border border-slate-100 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center text-brand-emerald">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Available Balance</p>
                                        <h3 className="text-2xl font-black text-brand-navy tracking-tighter">₦450,000.00</h3>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-brand-mint rounded-full flex items-center justify-center text-brand-emerald shadow-inner">
                                    <ArrowRight className="w-4 h-4 -rotate-45" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Link to="/login" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-surface hover:border-brand-emerald/40 hover:shadow-card transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface rounded-xl shadow-sm text-slate-600 flex items-center justify-center group-hover:text-brand-emerald transition-colors">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-brand-navy">Electricity Token</p>
                                            <p className="text-xs text-slate-400 font-medium tracking-tight">IKEDC Prepaid</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-brand-navy">-₦15,000</span>
                                </Link>

                                <Link to="/login" className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-surface hover:border-brand-emerald/40 hover:shadow-card transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface rounded-xl shadow-sm text-slate-600 flex items-center justify-center group-hover:text-brand-emerald transition-colors">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-brand-navy">Mobile Data</p>
                                            <p className="text-xs text-slate-400 font-medium tracking-tight">MTN 10GB Plan</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-brand-navy">-₦3,200</span>
                                </Link>
                            </div>
                        </div>

                        {/* Floating Security Badge */}
                        <div className="absolute -bottom-6 -left-12 z-30 bg-brand-navy text-white rounded-2xl p-5 shadow-2xl flex items-center gap-4 transform rotate-3 animate-bounce shadow-brand-emerald/20">
                            <div className="w-10 h-10 bg-brand-navy-800 rounded-xl flex items-center justify-center text-brand-emerald">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold tracking-wide">Bank-Grade</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Security</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
