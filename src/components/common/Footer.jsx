import React from 'react';

const Footer = () => {
    return (
        <footer id="contact" className="bg-slate-900 text-slate-200">
            <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-2xl bg-white text-slate-900 grid place-items-center font-black">D</div>
                        <span className="font-extrabold text-white text-lg">DahaTech</span>
                    </div>
                    <p className="mt-3 text-slate-400 text-sm">Fast, affordable and secure data, airtime and bills for everyone in Nigeria.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-3">Products</h5>
                    <ul className="space-y-2 text-slate-400 text-sm">
                        <li>Data & Airtime</li>
                        <li>TV Subscription</li>
                        <li>Electricity Bills</li>
                        <li>Bulk SMS</li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-3">Company</h5>
                    <ul className="space-y-2 text-slate-400 text-sm">
                        <li>About</li>
                        <li>Agents</li>
                        <li>Careers</li>
                        <li>Compliance</li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-3">Get in touch</h5>
                    <ul className="space-y-2 text-slate-400 text-sm">
                        <li>support@dahatech.ng</li>
                        <li>+234 814 614 9773</li>
                        <li>Mon–Sun, 24/7</li>
                    </ul>
                    <div className="mt-4 text-xs text-slate-500">© {new Date().getFullYear()} DahaTech Nigeria Ltd.</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;