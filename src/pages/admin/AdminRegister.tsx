// src/pages/admin/AdminRegister.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../services/api/apiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../../layouts/auth/AuthLayout";

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
            const res = await API.post("/auth/register", payload);

            // If backend sets cookie and returns user, navigate to admin area
            if (res.data?.ok && res.data?.user) {
                toast.success("Admin created successfully! Redirecting…", { position: "top-center" });
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
            <form onSubmit={onSubmit} className="bg-white px-8 py-4 rounded-2xl shadow-sm w-full max-w-md border border-slate-200">
                <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Create Admin</h2>

                {error && (
                    <p className="mb-4 p-4 text-sm text-red-600 bg-red-50 rounded-lg shadow-sm border border-red-200">
                        {error}
                    </p>
                )}

                {/* Name */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-slate-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter full name"
                        required
                    />
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter email"
                        required
                    />
                </div>

                {/* Phone */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-slate-700">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0XXXXXXXXXX or +234XXXXXXXXXX"
                        required
                    />
                    {phoneError && <p className="text-red-600 text-sm mt-1">{phoneError}</p>}
                </div>

                {/* Password (with eye toggle) */}
                <div className="mb-4 relative">
                    <label className="block text-sm font-medium mb-1 text-slate-700">Password</label>
                    <input
                        type={isPasswordVisible ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible((v) => !v)}
                        className="absolute right-3 top-[34px] text-slate-500"
                        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    >
                        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Terms & policies */}
                <div className="mb-4 flex items-center">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={isChecked}
                        onChange={() => setIsChecked(!isChecked)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label
                        htmlFor="terms"
                        className={`ml-2 text-sm ${!isChecked ? "text-red-600" : "text-slate-600"}`}
                    >
                        I agree to the{" "}
                        <Link to="/terms" className="text-blue-600 underline">Terms and Conditions</Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-blue-600 underline">Privacy Policy</Link>.
                    </label>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-slate-700">Roles</label>
                    <div className="flex gap-3 flex-wrap">
                        {ROLE_OPTIONS.map((r) => (
                            <label key={r} className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={roles.includes(r)}
                                    onChange={() => toggleRole(r)}
                                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700 capitalize">{r}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex justify-center">
                            <ClipLoader size={20} color="#fff" />
                        </div>
                    ) : (
                        "Create Admin Account"
                    )}
                </button>

                <p className="mt-4 text-sm text-center text-slate-600">
                    Already have an admin account?{" "}
                    <Link to="/admin/login" className="text-blue-600 hover:underline">Sign in</Link>
                </p>
            </form>
        </AuthLayout>
    );
}
