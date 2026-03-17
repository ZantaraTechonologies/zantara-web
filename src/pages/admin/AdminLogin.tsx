// src/pages/admin/AdminLogin.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../services/api/apiClient";
import AuthLayout from "../../layouts/auth/AuthLayout";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        try {
            await API.post("/auth/login", { email, password });
            // Prefer a guaranteed route. If your app uses /admin/dashboard, change it here.
            nav("/admin/status");
        } catch (e: any) {
            const status = e?.response?.status;
            const msg =
                e?.response?.data?.message ??
                (status === 401
                    ? "Invalid credentials."
                    : status === 403
                        ? "You’re signed in but not allowed to access the admin console."
                        : "Login failed. Please try again.");
            setErr(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout title="Admin Sign In" subtitle="Access the admin console">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h1 className="text-2xl font-bold mb-1">Admin Sign In</h1>
                <p className="text-sm text-slate-600 mb-6">Access the admin console</p>

                {err && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                        {err}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            className="w-full border rounded-xl px-3 py-2"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.trim())}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm mb-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="w-full border rounded-xl px-3 py-2 pr-10"
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((s) => !s)}
                            className="absolute right-3 top-[34px] text-slate-500"
                            aria-label={showPw ? "Hide password" : "Show password"}
                        >
                            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 text-white py-2 disabled:opacity-60"
                    >
                        {loading ? "Signing in…" : "Sign in"}
                    </button>
                </form>

                <div className="text-sm text-slate-600 mt-4">
                    Need an admin account?{" "}
                    <Link to="/admin/register" className="text-blue-600 underline">
                        Register
                    </Link>
                </div>

                <div className="text-xs text-slate-500 mt-3">
                    If you’re not an admin, please use the{" "}
                    <Link to="/login" className="text-blue-600 underline">user sign in</Link>.
                </div>
            </div>
        </AuthLayout>
    );
}
