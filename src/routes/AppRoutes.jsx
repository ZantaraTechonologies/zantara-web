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
import UserWalletPage from '../pages/user/UserWalletPage';
import UserFundWalletPage from '../pages/user/UserFundWalletPage';
import UserWithdrawPage from '../pages/user/UserWithdrawPage';
import UserLinkedAccountsPage from '../pages/user/UserLinkedAccountsPage';
import UserVirtualAccountPage from '../pages/user/UserVirtualAccountPage';
import UserBuyDataPage from "../pages/user/UserBuyDataPage";
import UserBuyAirtimePage from "../pages/user/UserBuyAirtimePage";
import UserBuyElectricityPage from "../pages/user/UserBuyElectricityPage";
import UserBuyCablePage from "../pages/user/UserBuyCablePage";
import UserBuyExamPinPage from "../pages/user/UserBuyExamPinPage";
import TransactionStatusPage from "../pages/user/TransactionStatusPage";
import UserTransactionsPage from '../pages/user/Transactions';
import PaystackReturn from '../pages/user/PaystackReturn';
import ReferralPage from '../pages/user/Referral';
import UserProfilePage from '../pages/user/UserProfilePage';
import UserPersonalInfoPage from '../pages/user/UserPersonalInfoPage';
import UserSecuritySettingsPage from '../pages/user/UserSecuritySettingsPage';
import UserPinSetupPage from '../pages/user/UserPinSetupPage';
import UserChangePasswordPage from '../pages/user/UserChangePasswordPage';
import KYCLevelsPage from '../pages/user/KYCLevelsPage';
import KYCUploadPage from '../pages/user/KYCUploadPage';
import KYCStatusPage from '../pages/user/KYCStatusPage';

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
                    
                    {/* Wallet Ecosystem (Batch 2) */}
                    <Route path="wallet" element={<UserWalletPage />} />
                    <Route path="wallet/fund" element={<UserFundWalletPage />} />
                    <Route path="wallet/withdraw" element={<UserWithdrawPage />} />
                    <Route path="wallet/linked-accounts" element={<UserLinkedAccountsPage />} />
                    <Route path="wallet/virtual-account" element={<UserVirtualAccountPage />} />

                    {/* Services Ecosystem (Batch 3) */}
                    <Route path="services/data" element={<UserBuyDataPage />} />
                    <Route path="services/airtime" element={<UserBuyAirtimePage />} />
                    <Route path="services/electricity" element={<UserBuyElectricityPage />} />
                    <Route path="services/cable" element={<UserBuyCablePage />} />
                    <Route path="services/exam-pins" element={<UserBuyExamPinPage />} />
                    <Route path="services/status" element={<TransactionStatusPage />} />

                    <Route path="transactions" element={<UserTransactionsPage />} />
                    <Route path="referral" element={<ReferralPage />} />

                    {/* Profile & Security (Batch 4) */}
                    <Route path="profile" element={<UserProfilePage />} />
                    <Route path="profile/personal" element={<UserPersonalInfoPage />} />
                    <Route path="profile/security" element={<UserSecuritySettingsPage />} />
                    <Route path="profile/security/password" element={<UserChangePasswordPage />} />
                    <Route path="profile/security/pin" element={<UserPinSetupPage />} />

                    {/* KYC System (Batch 4) */}
                    <Route path="kyc" element={<KYCLevelsPage />} />
                    <Route path="kyc/upload" element={<KYCUploadPage />} />
                    <Route path="kyc/status" element={<KYCStatusPage />} />
                </Route>

                {/* Legacy redirects */}
                <Route path="/buy/*" element={<Navigate to="/app/services/data" replace />} />
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
