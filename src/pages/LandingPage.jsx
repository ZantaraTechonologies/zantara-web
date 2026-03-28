import React, { useState } from "react";
import { Check, ChevronRight, Smartphone, Wifi, Tv, Zap, MessageSquare, Shield, CreditCard, Bolt, PhoneCall, ArrowRight, Star, Users } from "lucide-react";
import { useWalletStore } from "../store/wallet/walletStore";

import mtnLogo from "../assets/mtn.png";
import airtelLogo from "../assets/airtel.png";
import gloLogo from "../assets/glo.png";
import nineMobileLogo from "../assets/9mobile.png";

import Navbar from "../components/navigation/Navbar";
import Footer from "../components/common/Footer";

const networks = [
    { key: "mtn", name: "MTN", logo: mtnLogo },
    { key: "airtel", name: "Airtel", logo: airtelLogo },
    { key: "glo", name: "Glo", logo: gloLogo },
    { key: "etisalat", name: "9mobile", logo: nineMobileLogo },
];

const samplePlans = {
    mtn: [
        { size: "500MB", price: 350, validity: "1 Day" },
        { size: "1GB", price: 600, validity: "7 Days" },
        { size: "3GB", price: 1400, validity: "30 Days" },
        { size: "10GB", price: 4200, validity: "30 Days" },
    ],
    airtel: [
        { size: "500MB", price: 300, validity: "1 Day" },
        { size: "1.5GB", price: 950, validity: "30 Days" },
        { size: "5GB", price: 2900, validity: "30 Days" },
    ],
    glo: [
        { size: "1GB", price: 500, validity: "5 Days" },
        { size: "2.9GB", price: 1000, validity: "14 Days" },
        { size: "10GB", price: 3500, validity: "30 Days" },
    ],
    etisalat: [
        { size: "500MB", price: 350, validity: "1 Day" },
        { size: "2GB", price: 1200, validity: "30 Days" },
        { size: "11GB", price: 4000, validity: "30 Days" },
    ],
};

const Stat = ({ icon: Icon, label, value, suffix }) => (
    <div className="bg-white/95 backdrop-blur rounded-[2rem] shadow-sm border border-slate-50 p-6 flex flex-col items-center gap-4">
        <div className="p-3 rounded-2xl bg-emerald-50">
            <Icon className="w-6 h-6 text-emerald-500" />
        </div>
        <div className="text-center">
            <div className="text-2xl font-black text-slate-900 tracking-tighter">
                {value}
                <span className="text-slate-300 ml-1">{suffix}</span>
            </div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{label}</div>
        </div>
    </div>
);

const Feature = ({ icon: Icon, title, desc }) => (
    <div className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all border border-slate-50">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Icon className="w-7 h-7 text-emerald-500" /></div>
        <h4 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">{title}</h4>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
);

const PlanCard = ({ plan }) => {
    const { currency } = useWalletStore();
    return (
        <div className="rounded-[2.5rem] border border-slate-50 bg-white p-7 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
            <div className="flex items-baseline justify-between mb-4">
                <h5 className="text-2xl font-black text-slate-900 tracking-tighter">{plan.size}</h5>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-100">{plan.validity}</span>
            </div>
            <div className="flex items-center gap-2 mb-6">
                <div className="text-3xl font-black text-slate-900 tracking-tighter">{currency}{plan.price.toLocaleString()}</div>
                <span className="text-slate-400 text-xs font-medium">FIXED</span>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-[1.25rem] bg-slate-950 hover:bg-emerald-500 text-white hover:text-slate-950 py-4 font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-slate-100 active:scale-95">
                GET STARTED <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};

const Testimonial = ({ quote, name, role }) => (
    <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-50 flex flex-col justify-between h-full">
        <div>
            <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />)}
            </div>
            <p className="text-slate-600 font-medium leading-relaxed italic text-lg tracking-tight">"{quote}"</p>
        </div>
        <div className="mt-8">
            <div className="font-bold text-slate-900 text-sm">{name}</div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{role}</div>
        </div>
    </div>
);

export default function ZantaraLanding() {
    const [activeNet, setActiveNet] = useState(networks[0].key);

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans">
            {/* NAV */}
            <Navbar />

            {/* HERO */}
            <section className="relative overflow-hidden pt-10">
                <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:pb-32 md:pt-20 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">Premium Fintech Infrastructure</span>
                        <h1 className="mt-8 text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.95]">Automated VTU Terminal.</h1>
                        <p className="mt-6 text-slate-500 text-xl leading-relaxed font-medium max-w-lg">Secure your digital assets. Zantara provides elite-level automation for data, airtime, and utility settlements across Nigeria.</p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <a
                                href="/register"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-[1.5rem] bg-slate-950 hover:bg-emerald-500 text-white hover:text-slate-950 font-black uppercase tracking-widest text-xs transition-all shadow-2xl shadow-slate-200"
                            >
                                Launch Account <ArrowRight className="w-5 h-5" />
                            </a>
                            <a
                                href="#pricing"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-[1.5rem] border border-slate-100 hover:bg-slate-50 text-slate-900 font-black uppercase tracking-widest text-xs transition-all"
                            >
                                Inventory Pricing
                            </a>
                        </div>
                        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <Stat icon={Users} label="Verified Nodes" value="10k" suffix="+" />
                            <Stat icon={Shield} label="Uptime Sla" value="99.9" suffix="%" />
                            <Stat icon={Zap} label="Response Time" value="3.2" suffix="s" />
                            <Stat icon={CreditCard} label="Encryption" value="AES" suffix="-256" />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="relative rounded-[3rem] p-8 shadow-2xl shadow-slate-200 bg-white border border-slate-50">
                            <div className="flex items-center gap-6 mb-8 overflow-x-auto pb-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                                {networks.map(n => (
                                    <img key={n.key} src={n.logo} alt={n.name} className="h-8 object-contain" />
                                ))}
                            </div>
                            <div className="rounded-[2.5rem] bg-slate-50 p-8 border border-slate-100">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Rapid Fulfillment Terminal</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="rounded-2xl bg-white border border-slate-100 p-5 flex flex-col items-center gap-3 hover:border-emerald-500/30 hover:shadow-lg transition-all group">
                                        <Wifi className="w-6 h-6 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Data</span>
                                    </button>
                                    <button className="rounded-2xl bg-white border border-slate-100 p-5 flex flex-col items-center gap-3 hover:border-emerald-500/30 hover:shadow-lg transition-all group">
                                        <Smartphone className="w-6 h-6 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Airtime</span>
                                    </button>
                                    <button className="rounded-2xl bg-white border border-slate-100 p-5 flex flex-col items-center gap-3 hover:border-emerald-500/30 hover:shadow-lg transition-all group">
                                        <Tv className="w-6 h-6 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Cable</span>
                                    </button>
                                    <button className="rounded-2xl bg-white border border-slate-100 p-5 flex flex-col items-center gap-3 hover:border-emerald-500/30 hover:shadow-lg transition-all group">
                                        <Bolt className="w-6 h-6 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Power</span>
                                    </button>
                                </div>
                                <div className="mt-6 space-y-4">
                                    <input className="w-full rounded-2xl border border-slate-100 p-5 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="Enter recipient ID..." />
                                    <button className="w-full rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-black uppercase tracking-widest text-xs py-5 transition-all shadow-xl shadow-emerald-500/10">Continue</button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -z-10 -top-20 -right-20 w-96 h-96 bg-emerald-100/50 rounded-full blur-[100px]" />
                        <div className="absolute -z-10 -bottom-20 -left-20 w-96 h-96 bg-slate-100/50 rounded-full blur-[100px]" />
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="mx-auto max-w-7xl px-6 py-20 md:py-32">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">The Zantara Advantage</span>
                    <h2 className="mt-4 text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">Engineered for Velocity.</h2>
                    <p className="mt-6 text-slate-500 text-xl font-medium">Enterprise-grade automation, wholesale liquidity, and surgical precision for every settlement.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Feature icon={Wifi} title="Instant Data Flow" desc="Reliable bundles across MTN, Airtel, Glo & 9mobile with sub-second automated fulfilment." />
                    <Feature icon={Smartphone} title="Airtime Liquidity" desc="High-volume VTU terminal for all networks with significant yield on every purchase." />
                    <Feature icon={Bolt} title="Power Settlements" desc="Bypass legacy queues. Direct Disco API integration for nationwide utility payments." />
                    <Feature icon={Tv} title="Secure Media" desc="DSTV, GOtv & Startimes—encrypted renewal protocols for uninterrupted entertainment." />
                    <Feature icon={Shield} title="Military-Grade Security" desc="AES-256 encryption, PCI-DSS L3 payments & hardware-level account protection." />
                    <Feature icon={MessageSquare} title="Priority Comms" desc="24/7 dedicated support ops via encrypted chat, WhatsApp & terminal hotlines." />
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing" className="bg-slate-50/50 border-y border-slate-50">
                <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Live Inventory</span>
                            <h3 className="mt-4 text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Wholesale Pricing.</h3>
                            <p className="mt-4 text-slate-500 font-medium">Transparent settlement rates. Optimized for high-volume resellers.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-2xl p-2 border border-slate-100 shadow-sm">
                            {networks.map(n => (
                                <button key={n.key} onClick={() => setActiveNet(n.key)} className={`flex items-center gap-3 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all ${activeNet === n.key ? "bg-slate-950 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:bg-slate-50"}`}>
                                    <img src={n.logo} className={`h-4 transition-all ${activeNet === n.key ? "grayscale-0" : "grayscale opacity-50"}`} />
                                    {n.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {samplePlans[activeNet].map((p, i) => <PlanCard key={i} plan={p} />)}
                    </div>

                    <div className="mt-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">* Live terminal rates may fluctuate based on network load and API throughput.</div>
                </div>
            </section>

            {/* AGENT CTA */}
            <section className="mx-auto max-w-7xl px-6 py-20 md:py-32">
                <div className="rounded-[3.5rem] overflow-hidden bg-slate-950 text-white p-10 md:p-20 flex flex-col lg:flex-row items-center justify-between gap-16 relative shadow-2xl shadow-slate-200">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                    <div className="relative z-10 lg:max-w-xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Institutional Access</span>
                        <h3 className="mt-6 text-4xl md:text-6xl font-black tracking-tighter leading-tight">Join the Zantara Reseller Network.</h3>
                        <p className="mt-6 text-slate-400 text-lg font-medium leading-relaxed">Scale your local operations with our institutional-grade VTU backbone. Receive dedicated liquidity, sub-accounts, and real-time reconciliation.</p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <a
                                href="/register"
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-[1.5rem] bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20"
                            >
                                Deploy Node <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                    <div className="shrink-0 grid grid-cols-2 gap-4 w-full lg:w-[480px] relative z-10">
                        <div className="rounded-[2rem] bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
                            <div className="text-4xl font-black text-emerald-400 tracking-tighter">{useWalletStore.getState().currency}1.5m+</div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Avg. Monthly Yield</div>
                        </div>
                        <div className="rounded-[2rem] bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
                            <div className="text-4xl font-black text-emerald-400 tracking-tighter">1.2ms</div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">API Response Latency</div>
                        </div>
                        <div className="rounded-[2rem] bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
                            <div className="text-4xl font-black text-emerald-400 tracking-tighter">24/7</div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">NOC Support</div>
                        </div>
                        <div className="rounded-[2rem] bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
                            <div className="text-4xl font-black text-emerald-400 tracking-tighter">0.0%</div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Deployment Fee</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="mx-auto max-w-7xl px-6 py-20 bg-slate-50/30 rounded-[3.5rem] mb-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Evidence of Performance</span>
                    <h3 className="mt-4 text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Trusted Across the Region.</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <Testimonial quote="The Zantara bridge is sub-second. My retail customers are always impressed by the fulfillment speed." name="Hauwa A." role="Network Node – Abuja" />
                    <Testimonial quote="Institutional-grade reliability. The reconciliation receipts made our SME audit seamless." name="Deji O." role="Corporate Entity – Lagos" />
                    <Testimonial quote="The NOC support is exceptional. Instant resolution for our liquidity transfers at any hour." name="Blessing I." role="Registered Agent – PH" />
                </div>
            </section>

            {/* FOOTER */}
            <Footer />

            {/* Floating support bubble */}
            <a href="#" className="fixed bottom-10 right-10 w-16 h-16 rounded-full shadow-2xl bg-slate-950 hover:bg-emerald-500 text-white hover:text-slate-950 flex items-center justify-center transition-all group active:scale-90 border border-white/10">
                <MessageSquare className="w-6 h-6" />
                <span className="absolute right-full mr-4 bg-slate-950 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 shadow-xl">Contact NOC</span>
            </a>
        </div>
    );
}

function LockIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
