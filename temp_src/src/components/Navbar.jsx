import React from "react";
import { Link } from "react-router-dom";
import { PhoneCall, LockIcon } from "lucide-react"; // Example of icons from lucide-react

const Navbar = () => {
    return (
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-slate-100">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-sky-600 grid place-items-center text-white font-black">D</div>
                    <span className="font-extrabold tracking-tight text-slate-900 text-lg">DahaTech</span>
                </a>
                <nav className="hidden md:flex items-center gap-6 text-sm">
                    <a href="#features" className="hover:text-sky-700">Features</a>
                    <a href="#pricing" className="hover:text-sky-700">Pricing</a>
                    <a href="#faq" className="hover:text-sky-700">FAQ</a>
                    <a href="#contact" className="hover:text-sky-700">Contact</a>
                </nav>
                <div className="flex items-center gap-3">
                    <a
                        href="https://wa.me/2348146149773" // Replace with your phone number
                        target="_blank"
                        className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                    >
                        <PhoneCall className="w-4 h-4" /> Support
                    </a>
                    <a
                        href="/login"  // Link to the login page
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white"
                    >
                        <LockIcon /> Login
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Navbar;