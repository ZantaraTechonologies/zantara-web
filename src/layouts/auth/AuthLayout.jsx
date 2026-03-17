// src/layouts/auth/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/navigation/Navbar';
import Footer from '../../components/common/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    {children || <Outlet />}
                </div>
            </main>
            <Footer />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default AuthLayout;
