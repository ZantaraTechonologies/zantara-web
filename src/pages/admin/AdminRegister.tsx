// src/pages/admin/AdminRegister.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../services/api/apiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../../layouts/auth/AuthLayout";
import { useAuthStore } from "../../store/auth/authStore";
import * as authService from "../../services/auth/authService";

// Mirror user's phone validation/normalization (Nigeria)
const phoneRegex = /^(?:\+234|0)(\d{10})$/;

const ROLE_OPTIONS = ["admin", "superAdmin"]; // extend later if needed

export default function AdminRegister() {
    const nav = useNavigate();

    // Same fields as user register:
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });

    // Admin-only: roles (default to ["admin"])
    const [roles, setRoles] = useState<string[]>(["admin"]);

    // UI/validation states (match user page UX)
    const [error, setError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string>("");
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { setAuth } = useAuthStore();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        if (name === "phone") setPhoneError("");
        if (name === "email") setError(null);
    }

    // Keep same normalization as user form
    function normalizePhone(input: string) {
        let phone = input.trim();
        if (phone.startsWith("+234")) phone = "0" + phone.slice(4);
        return phone;
    }

    function toggleRole(r: string) {
        setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // validate phone like user form
        const normalizedPhone = normalizePhone(formData.phone);
        if (!phoneRegex.test(normalizedPhone)) {
            setPhoneError("Please enter a valid Nigerian phone number.");
            setIsLoading(false);
            return;
        }

        // enforce terms like user form
        if (!isChecked) {
            setError("You must agree to the Terms and Conditions and Privacy Policy.");
            setIsLoading(false);
            return;
        }

        try {
            // Send to admin endpoint with roles
            const payload = { ...formData, phone: normalizedPhone, roles };
            const res = await authService.register(payload);

            // If backend sets cookie and returns user, navigate to admin area
            if (res.token || res.user || res.ok) {
                toast.success("Admin created successfully! Welcome 👋", { position: "top-center" });
                if (res.user && res.token) setAuth(res.user, res.token);
                nav("/admin/status");
                return;
            }

            // Fallback: show success then go to admin login
            toast.success("Admin created. Please sign in.", { position: "top-center" });
            nav("/admin/login");
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                (err?.response?.status === 409 ? "Email already registered." : "Registration failed.");
            setError(msg);
            toast.error(msg, { position: "top-center" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout title="Create Admin" subtitle="Set up a new admin account">
            <form onSubmit={onSubmit} className="bg-white px-8 py-10 rounded-3xl shadow-xl shadow-slate-100 w-full max-w-md border border-slate-50">
                <h2 className="text-2xl font-bold mb-8 text-center text-slate-900 tracking-tight uppercase">Admin Provision</h2>

                {error && (
                    <div className="mb-6 p-4 text-xs font-bold text-red-600 bg-red-50 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {/* Name */}
                <div className="mb-6">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">Identity Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold placeholder:text-slate-200 transition-all"
                        placeholder="Full Name"
                        required
                    />
                </div>

                {/* Email */}
                <div className="mb-6">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">Network Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold placeholder:text-slate-200 transition-all"
                        placeholder="admin@zantara.com"
                        required
                    />
                </div>

                {/* Phone */}
                <div className="mb-6">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">Verification Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold placeholder:text-slate-200 transition-all"
                        placeholder="080XXXXXXXX"
                        required
                    />
                    {phoneError && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-tight">{phoneError}</p>}
                </div>

                {/* Password (with eye toggle) */}
                <div className="mb-6 relative">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">Security Phrase</label>
                    <input
                        type={isPasswordVisible ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border border-slate-100 rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold placeholder:text-slate-200 transition-all"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible((v) => !v)}
                        className="absolute right-5 top-[42px] text-slate-300 hover:text-emerald-500 transition-colors"
                        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    >
                        {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Terms & policies */}
                <div className="mb-8 flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={isChecked}
                        onChange={() => setIsChecked(!isChecked)}
                        className="h-5 w-5 text-emerald-500 rounded-lg border-slate-200 focus:ring-emerald-500/20 mt-0.5"
                    />
                    <label
                        htmlFor="terms"
                        className={`text-[11px] font-medium leading-relaxed ${!isChecked ? "text-red-500" : "text-slate-500"}`}
                    >
                        I acknowledge the level of authority granted and agree to the{" "}
                        <Link to="/terms" className="text-emerald-600 font-bold hover:underline">Security Protocols</Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-emerald-600 font-bold hover:underline">Privacy Code</Link>.
                    </label>
                </div>

                <div className="mb-8">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-4 text-slate-400 text-center">Authorization Level</label>
                    <div className="flex gap-4 justify-center">
                        {ROLE_OPTIONS.map((r) => (
                            <label key={r} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer ${roles.includes(r) ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'}`}>
                                <input
                                    type="checkbox"
                                    checked={roles.includes(r)}
                                    onChange={() => toggleRole(r)}
                                    className="hidden"
                                />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{r}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full bg-slate-950 hover:bg-emerald-500 text-white hover:text-slate-950 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-slate-100 disabled:opacity-60"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex justify-center">
                            <ClipLoader size={20} color="currentColor" />
                        </div>
                    ) : (
                        "Authorize Admin"
                    )}
                </button>

                <p className="mt-8 text-[11px] font-bold text-center text-slate-400 uppercase tracking-widest">
                    Existing operative?{" "}
                    <Link to="/admin/login" className="text-emerald-600 hover:underline">Sign in here</Link>
                </p>
            </form>
        </AuthLayout>
    );
}
