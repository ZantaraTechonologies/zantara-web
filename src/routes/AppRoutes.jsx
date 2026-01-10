// src/routes/AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

// USER auth hook (yours)
import { useAuth } from '../hooks/useAuth';

// USER pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import WalletPage from '../pages/wallet/WalletPage';
import DahaTechLanding from '../pages/LandingPage';
import PrivacyPolicy from '../components/PrivacyPolicy';
import TermsAndConditions from '../components/TermsAndConditions';
import BuyDataPage from "../pages/buy/BuyDataPage";
import BuyAirtimePage from "../pages/buy/BuyAirtimePage";
import BuyCablePage from "../pages/buy/BuyCablePage";
import BuyExamPinPage from "../pages/buy/BuyExamPinPage";
import UserTransactionsPage from '../pages/transactions/Transactions';
import PaystackReturn from '../pages/wallet/PaystackReturn';
import ReferralPage from '../pages/dashboard/Referral';

// ADMIN layout/pages you already have
import AdminLayout from '../components/admin/AdminLayout';
import { StatusPage } from '../pages/admin/StatusPage';
import TransactionsPage from '../pages/admin/TransactionsPage';

// ✨ NEW: admin auth pages (create these from earlier snippets)
import AdminLogin from '../pages/admin/AdminLogin';
import AdminRegister from '../pages/admin/AdminRegister';

/* ---------- USER GUARDS ---------- */
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

function AuthRoute({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const from = location.state?.from?.pathname;
    return isAuthenticated ? <Navigate to={from || "/wallet-page"} replace /> : children;
}

/* ---------- ADMIN GUARD ---------- */
/** Calls /api/admin/auth/me and only allows roles: 'admin' or 'superAdmin' */
function AdminProtectedRoute() {
    const [state, setState] = useState('loading'); // 'loading' | 'ok' | 'unauth' | 'forbidden'

    useEffect(() => {
        let alive = true;
        const BASE = import.meta.env.VITE_API_URL || '/api';
        (async () => {
            try {
                const res = await fetch(`${BASE}/admin/auth/me`, { credentials: 'include' });
                if (!alive) return;
                if (res.status === 401) { setState('unauth'); return; }
                if (res.status === 403) { setState('forbidden'); return; }
                const data = await res.json();
                const roles = Array.isArray(data?.roles) ? data.roles : [];
                setState(roles.includes('admin') || roles.includes('superAdmin') ? 'ok' : 'forbidden');
            } catch {
                if (!alive) return;
                setState('unauth');
            }
        })();
        return () => { alive = false; };
    }, []);

    if (state === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    if (state === 'unauth') return <Navigate to="/admin/login" replace />;
    if (state === 'forbidden') {
        return (
            <div className="min-h-[60vh] grid place-items-center px-4">
                <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h1 className="text-2xl font-bold mb-2">Not authorized</h1>
                    <p className="text-slate-600 mb-4">
                        You’re signed in, but your account doesn’t have admin access (admin or superAdmin).
                    </p>
                    <div className="mt-4 flex gap-2">
                        <a href="/" className="px-4 py-2 rounded-lg border border-slate-300">Back to Home</a>
                        <a href="/admin/login" className="px-4 py-2 rounded-lg bg-slate-900 text-white">Switch account</a>
                    </div>
                </div>
            </div>
        );
    }
    return <Outlet />;
}

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* ---------- Public ---------- */}
                <Route path="/" element={<DahaTechLanding />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

                {/* USER auth */}
                <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
                <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

                {/* ADMIN auth (public) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register" element={<AdminRegister />} /> {/* hide in prod if needed */}

                {/* ---------- USER Protected ---------- */}
                <Route
                    path="/buy"
                    element={
                        <ProtectedRoute>
                            <Outlet />
                        </ProtectedRoute>
                    }
                >
                    <Route path="data" element={<BuyDataPage />} />
                    <Route path="airtime" element={<BuyAirtimePage />} />
                    <Route path="cable" element={<BuyCablePage />} />
                    <Route path="pin" element={<BuyExamPinPage />} />
                    <Route path="transactions-logs" element={<UserTransactionsPage />} />
                </Route>

                <Route path="/wallet-page" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
                <Route path="/paystack/return" element={<ProtectedRoute><PaystackReturn /></ProtectedRoute>} />

                {/* ---------- ADMIN Protected ---------- */}
                <Route element={<AdminProtectedRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="/admin/status" replace />} />
                        <Route path="status" element={<StatusPage />} />
                        <Route path="transactions" element={<TransactionsPage />} />
                        {/* add more admin pages here */}
                    </Route>
                </Route>

                {/* (Optional) catch-all */}
                {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
            </Routes>
        </Router>
    );
}
