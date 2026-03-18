import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/auth/AuthLayout";
import { useAuthStore } from "../../store/auth/authStore";
import * as authService from "../../services/auth/authService";

const phoneRegex = /^(?:\+234|0)(\d{10})$/;

const Register = () => {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
    const [error, setError] = useState(null);
    const [phoneError, setPhoneError] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        if (name === "phone") setPhoneError("");
        if (name === "email") setError(null);
    };

    const normalizePhone = (input) => {
        let phone = input.trim();
        // Convert +234xxxxxxxxxx -> 0xxxxxxxxxx
        if (phone.startsWith("+234")) phone = "0" + phone.slice(4);
        return phone;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Phone validation
        const normalizedPhone = normalizePhone(formData.phone);
        if (!phoneRegex.test(normalizedPhone)) {
            setPhoneError("Please enter a valid Nigerian phone number.");
            setIsLoading(false);
            return;
        }

        if (!isChecked) {
            setError("You must agree to the Terms and Conditions and Privacy Policy.");
            setIsLoading(false);
            return;
        }

        try {
            // Send registration
            const payload = { ...formData, phone: normalizedPhone };
            const res = await authService.register(payload);

            // If backend auto-logs in:
            if (res.token || res.user || res.ok) {
                toast.success("Registration successful! Welcome 👋", { position: "top-center" });
                if (res.user && res.token) setAuth(res.user, res.token);
                navigate("/app/wallet");
                return;
            }

            // Else (no auto-login): go to login
            toast.success("Registration successful! Please log in.", { position: "top-center" });
            navigate("/login");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                (err?.response?.status === 409 ? "Email already registered." : "Registration failed.");
            setError(msg);
            toast.error(msg, { position: "top-center" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit} className="bg-white px-8 py-8 rounded-2xl shadow-xl w-full">
                <h2 className="text-3xl font-black mb-8 text-center text-slate-900">Create Account</h2>

                {error && (
                    <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-slate-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-slate-700">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                            placeholder="john@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-slate-700">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full border ${phoneError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-sky-500'} rounded-xl px-4 py-3 focus:outline-none bg-slate-50 transition-all`}
                            placeholder="08100000000"
                            required
                        />
                        {phoneError && <p className="mt-1 text-red-600 text-xs font-medium">{phoneError}</p>}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-semibold mb-1.5 text-slate-700">Password</label>
                        <input
                            type={isPasswordVisible ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible((v) => !v)}
                            className="absolute right-4 top-11 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="flex items-start items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                            className="h-5 w-5 text-sky-600 rounded-lg border-slate-300 focus:ring-sky-400 cursor-pointer"
                        />
                        <label
                            htmlFor="terms"
                            className={`text-xs ${!isChecked ? "text-red-600" : "text-slate-600"} cursor-pointer leading-tight`}
                        >
                            I agree to the{" "}
                            <a href="/terms-and-conditions" className="text-sky-600 font-bold hover:underline">Terms</a>{" "}
                            &{" "}
                            <a href="/privacy-policy" className="text-sky-600 font-bold hover:underline">Privacy Policy</a>
                        </label>
                    </div>
                </div>

                <div className="mt-8">
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
                            "Create My Account"
                        )}
                    </button>
                </div>

                <p className="mt-8 text-center text-slate-600">
                    Already have an account?{" "}
                    <a href="/login" className="font-bold text-sky-600 hover:text-sky-700">Log In</a>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Register;