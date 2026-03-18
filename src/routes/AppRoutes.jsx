// src/routes/AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Route Guards
import ProtectedRoute from './guards/ProtectedRoute';
import AuthRoute from './guards/AuthRoute';
import AdminProtectedRoute from './guards/AdminProtectedRoute';

// Public Pages
import LandingPage from '../pages/LandingPage';
import PrivacyPolicy from '../pages/system/PrivacyPolicy';
import TermsAndConditions from '../pages/system/TermsAndConditions';

// Auth Pages
import UserLoginPage from '../pages/auth/UserLoginPage';
import UserRegisterPage from '../pages/auth/UserRegisterPage';
import UserOtpPage from '../pages/auth/UserOtpPage';
import UserForgotPasswordPage from '../pages/auth/UserForgotPasswordPage';

// User Pages
import DashboardLayout from '../layouts/user/DashboardLayout';
import UserDashboardPage from '../pages/user/UserDashboardPage';
import WalletPage from '../pages/user/WalletPage';
import BuyDataPage from "../pages/user/BuyDataPage";
import BuyAirtimePage from "../pages/user/BuyAirtimePage";
import BuyCablePage from "../pages/user/BuyCablePage";
import BuyExamPinPage from "../pages/user/BuyExamPinPage";
import UserTransactionsPage from '../pages/user/Transactions';
import PaystackReturn from '../pages/user/PaystackReturn';
import ReferralPage from '../pages/user/Referral';

// Admin Pages
import AdminLayout from '../layouts/admin/AdminLayout';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminRegister from '../pages/admin/AdminRegister';
import { StatusPage } from '../pages/admin/StatusPage';
import TransactionsPage from '../pages/admin/TransactionsPage';

// System Pages
import NotFound from '../pages/system/NotFound';
import NotAuthorized from '../pages/system/NotAuthorized';

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* ---------- Public Routes ---------- */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

                {/* ---------- Auth Routes ---------- */}
                <Route path="/login" element={<AuthRoute><UserLoginPage /></AuthRoute>} />
                <Route path="/register" element={<AuthRoute><UserRegisterPage /></AuthRoute>} />
                <Route path="/otp" element={<UserOtpPage />} />
                <Route path="/forgot-password" element={<UserForgotPasswordPage />} />
                
                {/* Admin Auth */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/register" element={<AdminRegister />} />

                {/* ---------- User (App) Protected Routes ---------- */}
                <Route
                    path="/app"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<UserDashboardPage />} />
                    <Route path="dashboard" element={<Navigate to="/app" replace />} />
                    <Route path="wallet" element={<WalletPage />} />
                    <Route path="buy/data" element={<BuyDataPage />} />
                    <Route path="buy/airtime" element={<BuyAirtimePage />} />
                    <Route path="buy/cable" element={<BuyCablePage />} />
                    <Route path="buy/pin" element={<BuyExamPinPage />} />
                    <Route path="transactions" element={<UserTransactionsPage />} />
                    <Route path="referral" element={<ReferralPage />} />
                </Route>

                {/* Legacy /buy redirect to /app/buy */}
                <Route path="/buy/*" element={<Navigate to="/app/buy" replace />} />
                <Route path="/wallet-page" element={<Navigate to="/app/wallet" replace />} />
                <Route path="/referral" element={<Navigate to="/app/referral" replace />} />
                <Route path="/paystack/return" element={<ProtectedRoute><PaystackReturn /></ProtectedRoute>} />

                {/* ---------- Admin Protected Routes ---------- */}
                <Route element={<AdminProtectedRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="status" element={<StatusPage />} />
                        <Route path="transactions" element={<TransactionsPage />} />
                        {/* More admin routes can be added here */}
                    </Route>
                </Route>

                {/* ---------- System Routes ---------- */}
                <Route path="/not-authorized" element={<NotAuthorized />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}
