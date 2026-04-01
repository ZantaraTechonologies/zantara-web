import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer id="contact" className="bg-white border-t border-slate-100 pt-20 pb-10">
            <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                <div className="lg:col-span-1">
                    <div className="flex items-center gap-3 mb-6">
                        <img src="/app_store_icon.png" alt="Zantara Logo" className="w-8 h-8 rounded-lg shadow-sm grayscale" />
                        <span className="font-black text-slate-900 text-xl tracking-tighter uppercase">Zantara</span>
                    </div>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                        The ultimate digital financial gateway. Fast, affordable, and secure data, airtime, and utility settlements for everyone.
                    </p>
                </div>

                <div>
                    <h5 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Products</h5>
                    <ul className="space-y-4">
                        <li><Link to="/login" className="text-slate-500 hover:text-emerald-500 font-medium text-sm transition-colors">Digital Wallet</Link></li>
                        <li><Link to="/login" className="text-slate-500 hover:text-emerald-500 font-medium text-sm transition-colors">Data & Airtime</Link></li>
                        <li><Link to="/login" className="text-slate-500 hover:text-emerald-500 font-medium text-sm transition-colors">TV Subscriptions</Link></li>
                        <li><Link to="/login" className="text-slate-500 hover:text-emerald-500 font-medium text-sm transition-colors">Electricity Bills</Link></li>
                    </ul>
                </div>

                <div>
                    <h5 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Company</h5>
                    <ul className="space-y-4">
                        <li><Link to="/privacy-policy" className="text-slate-500 hover:text-emerald-500 font-medium text-sm transition-colors">Privacy Policy</Link></li>
                        <li><Link to="/terms-and-conditions" className="text-slate-500 hover:text-emerald-500 font-medium text-sm transition-colors">Terms of Service</Link></li>
                        <li><Link to="/login" className="text-slate-500 hover:text-emerald-500 font-medium text-sm transition-colors">Referral & Agents</Link></li>
                        <li><Link to="/login" className="text-slate-500 hover:text-emerald-500 font-medium text-sm transition-colors">Support Center</Link></li>
                    </ul>
                </div>

                <div>
                    <h5 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Contact Us</h5>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-slate-500 font-medium text-sm">
                            <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>support@zantara.com</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-500 font-medium text-sm">
                            <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>+234 Support Line</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-500 font-medium text-sm">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>Nigeria, Mon–Sun 24/7 Operations</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">
                    © {new Date().getFullYear()} Zantara Technologies. All rights reserved.
                </p>
                <div className="flex gap-4 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        PCI DSS COMPLIANT
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;