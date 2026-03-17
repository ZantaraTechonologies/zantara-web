import React, { useState } from "react";
import { Check, ChevronRight, Smartphone, Wifi, Tv, Zap, MessageSquare, Shield, CreditCard, Bolt, PhoneCall, ArrowRight, Star, Users } from "lucide-react";

import mtnLogo from "../assets/mtn.png";
import airtelLogo from "../assets/airtel.png";
import gloLogo from "../assets/glo.png";
import nineMobileLogo from "../assets/9mobile.png";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-5 flex flex-col items-center gap-4">
        <div className="p-3 rounded-xl bg-sky-100">
            <Icon className="w-6 h-6 text-sky-600" />
        </div>
        <div className="text-center">
            <div className="text-2xl font-extrabold text-slate-900">
                {value}
                <span className="text-slate-400 text-lg ml-1">{suffix}</span>
            </div>
            <div className="text-slate-600 text-sm">{label}</div>
        </div>
    </div>
);

const Feature = ({ icon: Icon, title, desc }) => (
    <div className="group bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-all border border-slate-100">
        <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center mb-4 group-hover:scale-110 transition"><Icon className="w-6 h-6 text-sky-600" /></div>
        <h4 className="font-semibold text-slate-900 mb-2">{title}</h4>
        <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
);

const PlanCard = ({ plan }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div className="flex items-baseline justify-between">
            <h5 className="text-xl font-bold text-slate-900">{plan.size}</h5>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{plan.validity}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
            <div className="text-2xl font-extrabold">₦{plan.price.toLocaleString()}</div>
            <span className="text-slate-500 text-sm">VAT incl.</span>
        </div>
        <button className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white py-2.5 font-medium">
            Buy now <ChevronRight className="w-4 h-4" />
        </button>
    </div>
);

const Testimonial = ({ quote, name, role }) => (
    <div className="rounded-2xl bg-white p-6 shadow border border-slate-100">
        <div className="flex gap-2 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
        </div>
        <p className="text-slate-700 leading-relaxed">{quote}</p>
        <div className="mt-4 text-sm text-slate-500">{name} • {role}</div>
    </div>
);

export default function DahaTechLanding() {
    const [activeNet, setActiveNet] = useState(networks[0].key);

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white text-slate-800">
            {/* NAV */}
            <Navbar />

            {/* HERO */}
            <section className="relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 pb-10 pt-7 md:pb-20 md:pt-14 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-full">Nigeria’s friendly data hub</span>
                        <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-slate-900">Buy cheap data, airtime & bills in seconds.</h1>
                        <p className="mt-4 text-slate-600 text-lg leading-relaxed">DahaTech lets you top up data, airtime, TV and electricity—fast, secure and affordable. Built for individuals, SMEs and resellers across Nigeria.</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href="#pricing"  // This will scroll to the pricing section
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                            >
                                Get Data <ArrowRight className="w-4 h-4" />
                            </a>
                            <a
                                href="#features"  // This will scroll to the features section
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold"
                            >
                                Become an Agent
                            </a>
                        </div>
                        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Stat icon={Users} label="Happy Customers" value="10k" suffix="+" />
                            <Stat icon={Shield} label="Uptime" value="99.9" suffix="%" />
                            <Stat icon={Zap} label="Avg. Delivery" value="3" suffix="s" />
                            <Stat icon={CreditCard} label="Secure Payments" value="PCI" suffix="-DSS" />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="relative rounded-3xl p-6 shadow-xl bg-white border border-slate-100">
                            <div className="flex items-center gap-3 mb-4">
                                {networks.map(n => (
                                    <img key={n.key} src={n.logo} alt={n.name} className="h-12 object-contain" />
                                ))}
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <div className="text-xs text-slate-500">Quick Purchase</div>
                                <div className="mt-2 grid grid-cols-2 gap-3">
                                    <button className="rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2 hover:border-sky-300"><Wifi className="w-4 h-4" /> Data</button>
                                    <button className="rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2 hover:border-sky-300"><Smartphone className="w-4 h-4" /> Airtime</button>
                                    <button className="rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2 hover:border-sky-300"><Tv className="w-4 h-4" /> TV</button>
                                    <button className="rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-2 hover:border-sky-300"><Bolt className="w-4 h-4" /> Electricity</button>
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    <input className="col-span-2 rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-sky-200 outline-none" placeholder="Enter phone number" />
                                    <button className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold">Continue</button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-sky-200/40 rounded-full blur-3xl" />
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="mx-auto max-w-7xl px-4 py-12 md:py-20">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900">Everything you need, in one tap</h2>
                    <p className="mt-3 text-slate-600">Automated delivery, wholesale pricing, and 24/7 support—so you can sell more and save more.</p>
                </div>
                <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <Feature icon={Wifi} title="Instant Data" desc="Reliable bundles across MTN, Airtel, Glo & 9mobile with automated fulfilment." />
                    <Feature icon={Smartphone} title="Airtime Top‑up" desc="Fast VTU for all networks with cashback on every purchase." />
                    <Feature icon={Bolt} title="Electricity Bills" desc="Pay PHCN and major discos nationwide without queues." />
                    <Feature icon={Tv} title="TV Subscriptions" desc="DSTV, GOtv & Startimes—renew in seconds and never miss a match." />
                    <Feature icon={Shield} title="Secure & Compliant" desc="Bank‑grade encryption, PCI‑DSS payments & 2FA account protection." />
                    <Feature icon={MessageSquare} title="Live Support" desc="We’re here 24/7 on chat, WhatsApp & phone for agents and users." />
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing" className="bg-slate-50 border-y border-slate-100">
                <div className="mx-auto max-w-7xl px-4 py-14">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900">Affordable data bundles</h3>
                            <p className="text-slate-600">Transparent prices. No hidden fees. Perfect for resellers.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200">
                            {networks.map(n => (
                                <button key={n.key} onClick={() => setActiveNet(n.key)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${activeNet === n.key ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
                                    <img src={n.logo} className="h-4" />
                                    {n.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {samplePlans[activeNet].map((p, i) => <PlanCard key={i} plan={p} />)}
                    </div>

                    <div className="mt-6 text-sm text-slate-500">*Prices are indicative; set your live rates from your dashboard.</div>
                </div>
            </section>

            {/* AGENT CTA */}
            <section className="mx-auto max-w-7xl px-4 py-16">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-sky-600 to-green-500 text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h3 className="text-3xl md:text-4xl font-black">Become a DahaTech Agent</h3>
                        <p className="mt-2 text-white/90 max-w-xl">Earn daily by selling cheap data, airtime and bill payments to your community. Get reseller discounts, dedicated support and detailed reports.</p>
                        <ul className="mt-4 space-y-2 text-white/95">
                            <li className="flex items-center gap-2"><Check className="w-5 h-5" /> Wholesale pricing</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5" /> Instant delivery & receipts</li>
                            <li className="flex items-center gap-2"><Check className="w-5 h-5" /> Wallet, cards & bank transfer</li>
                        </ul>
                        <div className="mt-6 flex gap-3">
                            <a
                                href="/register"  // Link to the registration page
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold"
                            >
                                Create free account
                            </a>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl ring-1 ring-white/60 hover:bg-white/10"
                            >
                                Talk to sales
                            </a>
                        </div>
                    </div>
                    <div className="shrink-0 grid grid-cols-2 gap-3 w-full md:w-[420px]">
                        <div className="rounded-2xl bg-white/10 p-5">
                            <div className="text-4xl font-black">₦1.2m</div>
                            <div className="text-white/90">Avg. monthly volume (top agents)</div>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-5">
                            <div className="text-4xl font-black">30s</div>
                            <div className="text-white/90">Typical delivery time</div>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-5">
                            <div className="text-4xl font-black">24/7</div>
                            <div className="text-white/90">Priority support</div>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-5">
                            <div className="text-4xl font-black">₦0</div>
                            <div className="text-white/90">Setup fee</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="mx-auto max-w-7xl px-4 py-8 md:py-14">
                <div className="text-center max-w-2xl mx-auto">
                    <h3 className="text-3xl font-black text-slate-900">Loved by customers across Nigeria</h3>
                    <p className="mt-2 text-slate-600">From Lagos to Kano, agents and individuals trust DahaTech for everyday connectivity.</p>
                </div>
                <div className="mt-8 grid md:grid-cols-3 gap-5">
                    <Testimonial quote="Smooth and fast! I switched my shop to DahaTech and profits improved." name="Hauwa A." role="Reseller – Abuja" />
                    <Testimonial quote="Buying data for my team is now a breeze. The receipts help with reconciliation." name="Deji O." role="SME – Lagos" />
                    <Testimonial quote="24/7 support is real. They picked at 2am and sorted my wallet instantly." name="Blessing I." role="Agent – PH" />
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mx-auto max-w-5xl px-4 py-12">
                <h3 className="text-3xl font-black text-slate-900 text-center">Frequently asked questions</h3>
                <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                    {[
                        { q: "How do I fund my wallet?", a: "Use bank transfer, cards or USSD from your dashboard. Wallet funds reflect instantly and are secured with PCI‑DSS compliant processors." },
                        { q: "Do you support all networks?", a: "Yes. MTN, Airtel, Glo and 9mobile data & airtime. We also support DSTV/GOtv/Startimes and electricity bills for major discos." },
                        { q: "Is there a reseller/agent program?", a: "Yes—create an account and switch to Agent to access wholesale rates, team sub‑accounts and monthly statements." },
                        { q: "Can I get receipts and webhook notifications?", a: "Every transaction comes with a downloadable receipt. Developers can enable webhooks for real‑time status updates." },
                    ].map((item, i) => (
                        <details key={i} className="p-5 group open:bg-slate-50">
                            <summary className="flex cursor-pointer items-center justify-between text-slate-900 font-semibold">
                                {item.q}
                                <ChevronRight className="w-5 h-5 transition group-open:rotate-90" />
                            </summary>
                            <p className="mt-2 text-slate-600">{item.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <Footer />

            {/* Floating help bubble */}
            <a href="#" className="fixed bottom-6 right-6 rounded-full shadow-xl bg-sky-600 hover:bg-sky-700 text-white p-4 inline-flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Chat
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
