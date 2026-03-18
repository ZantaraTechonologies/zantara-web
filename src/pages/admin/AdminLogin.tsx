// src/pages/admin/AdminLogin.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../../layouts/auth/AuthLayout";
import { useAuthStore } from "../../store/auth/authStore";

export default function AdminLogin() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const { login, error: storeError, loading } = useAuthStore();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await login({ email, password });
            nav("/admin/status");
        } catch (e: any) {
            // Error is handled by the store
        }
    }

    return (
        <AuthLayout title="Admin Sign In" subtitle="Access the admin console">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h1 className="text-2xl font-bold mb-1">Admin Sign In</h1>
                <p className="text-sm text-slate-600 mb-6">Access the admin console</p>

                {storeError && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                        {storeError}
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
