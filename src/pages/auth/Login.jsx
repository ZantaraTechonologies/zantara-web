// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/navigation/Navbar";
import Footer from "../../components/common/Footer";
import AuthLayout from "../../layouts/auth/AuthLayout";
import { useAuthStore } from "../../store/auth/authStore";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/wallet-page";

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setError(null);
    //     setIsLoading(true);

    //     try {
    //         await login({ email, password }); // <-- server sets cookie; context fetches /auth/me
    //         toast.success("Login successful!", { position: "top-center" });
    //         // navigate("/wallet-page");
    //         const location = useLocation();
    //         const from = location.state?.from?.pathname || "/wallet-page";
    //         navigate(from, { replace: true });
    //     } catch (err) {
    //         const msg = err?.response?.data?.message || "Login failed.";
    //         setError(msg);
    //         toast.error(msg, { position: "top-center" });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login({ email, password });
            toast.success("Login successful!", { position: "top-center" });
            navigate(from, { replace: true });
        } catch (err) {
            const msg = err?.response?.data?.message || "Login failed.";
            toast.error(msg, { position: "top-center" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit} className="bg-white px-8 py-8 rounded-2xl shadow-xl w-full">
                <h2 className="text-3xl font-black mb-8 text-center text-slate-900">Sign In</h2>

                {error && (
                    <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="mb-5">
                    <label className="block text-sm font-semibold mb-1.5 text-slate-700">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                        placeholder="john@example.com"
                        required
                    />
                </div>

                <div className="mb-8 relative">
                    <label className="block text-sm font-semibold mb-1.5 text-slate-700">Password</label>
                    <input
                        type={isPasswordVisible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-4 top-11 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <div className="mt-2 text-right">
                        <a href="/forgot-password" size="sm" className="text-sm font-medium text-sky-600 hover:underline">
                            Forgot password?
                        </a>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-sky-600 text-white py-3.5 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex justify-center">
                            <ClipLoader size={20} color="#fff" />
                        </div>
                    ) : (
                        "Login to Dashboard"
                    )}
                </button>

                <p className="mt-8 text-center text-slate-600">
                    Don't have an account?{" "}
                    <a href="/register" className="font-bold text-sky-600 hover:text-sky-700">Create Account</a>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Login;