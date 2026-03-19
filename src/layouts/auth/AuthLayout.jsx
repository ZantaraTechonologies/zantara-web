// src/layouts/auth/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/navigation/Navbar';
import Footer from '../../components/common/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-12 px-6 sm:px-10">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    {(title || subtitle) && (
                        <div className="text-center space-y-2 mb-2">
                            {title && <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{title}</h1>}
                            {subtitle && <p className="text-slate-500 font-medium">{subtitle}</p>}
                        </div>
                    )}
                    {children || <Outlet />}
                </div>
            </main>
            <Footer />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default AuthLayout;
