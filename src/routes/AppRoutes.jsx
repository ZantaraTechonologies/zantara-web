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
import ServicesPage from '../pages/user/ServicesPage';
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
import PaystackReturn from '../pages/user/PaystackReturn';
import ReferralProgramPage from '../pages/user/ReferralProgramPage';
import ReferralWalletPage from '../pages/user/ReferralWalletPage';
import RedeemEarningsPage from '../pages/user/RedeemEarningsPage';
import UserProfilePage from '../pages/user/UserProfilePage';
import UserPersonalInfoPage from '../pages/user/UserPersonalInfoPage';
import UserSecuritySettingsPage from '../pages/user/UserSecuritySettingsPage';
import UserPinSetupPage from '../pages/user/UserPinSetupPage';
import UserChangePasswordPage from '../pages/user/UserChangePasswordPage';
import KYCLevelsPage from '../pages/user/KYCLevelsPage';
import KYCUploadPage from '../pages/user/KYCUploadPage';
import KYCStatusPage from '../pages/user/KYCStatusPage';
import UserTransactionsPage from '../pages/user/UserTransactionsPage';
import TransactionDetailsPage from '../pages/user/TransactionDetailsPage';
import ReceiptPage from '../pages/user/ReceiptPage';
import UserNotificationsPage from '../pages/user/UserNotificationsPage';
import SupportCenterPage from '../pages/user/SupportCenterPage';
import CreateTicketPage from '../pages/user/CreateTicketPage';
import SupportTicketDetailsPage from '../pages/user/SupportTicketDetailsPage';

// Admin Pages
import AdminLayout from '../layouts/admin/AdminLayout';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminRegister from '../pages/admin/AdminRegister';
import { StatusPage } from '../pages/admin/StatusPage';
import TransactionsPage from '../pages/admin/TransactionsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminUserDetailPage from '../pages/admin/AdminUserDetailPage';
import AdminKycQueuePage from '../pages/admin/AdminKycQueuePage';
import AdminWithdrawalsPage from '../pages/admin/AdminWithdrawalsPage';
import AdminSupportTicketsPage from '../pages/admin/AdminSupportTicketsPage';
import AdminNotificationsControlPage from '../pages/admin/AdminNotificationsControlPage';
import AdminEarningsPage from '../pages/admin/AdminEarningsPage';
import AdminAuditLogsPage from '../pages/admin/AdminAuditLogsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

// System Pages
import NotFound from '../pages/system/NotFound';
import NotAuthorized from '../pages/system/NotAuthorized';
import MaintenancePage from '../pages/system/MaintenancePage';
import NoInternetPage from '../pages/system/NoInternetPage';
import ErrorPage from '../pages/system/ErrorPage';

import { useAuthStore } from '../store/auth/authStore';

const RootStateController = ({ children }) => {
    const { isMaintenanceMode, isNoInternet, globalError } = useAuthStore();

    if (isMaintenanceMode) return <MaintenancePage />;
    if (isNoInternet) return <NoInternetPage />;
    if (globalError) return <ErrorPage />;

    return children;
};

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* ---------- root state priority wrapper ---------- */}
                <Route element={<RootStateController children={<Outlet />} />}>
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
                        <Route path="services" element={<ServicesPage />} />
                        <Route path="dashboard" element={<Navigate to="/app" replace />} />
                        
                        {/* Wallet Ecosystem (Merged into Dashboard) */}
                        <Route path="wallet" element={<Navigate to="/app" replace />} />
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
                        <Route path="transactions/:id" element={<TransactionDetailsPage />} />
                        <Route path="transactions/:id/receipt" element={<ReceiptPage />} />
                        <Route path="referral" element={<ReferralProgramPage />} />
                        <Route path="referral/wallet" element={<ReferralWalletPage />} />
                        <Route path="referral/redeem" element={<RedeemEarningsPage />} />

                        {/* Communication (Batch 7) */}
                        <Route path="notifications" element={<UserNotificationsPage />} />
                        <Route path="support" element={<SupportCenterPage />} />
                        <Route path="support/create" element={<CreateTicketPage />} />
                        <Route path="support/tickets/:id" element={<SupportTicketDetailsPage />} />

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
                            <Route path="dashboard" element={<Navigate to="/admin" replace />} />
                            
                            <Route path="users" element={<AdminUsersPage />} />
                            <Route path="users/:id" element={<AdminUserDetailPage />} />
                            
                            <Route path="kyc" element={<AdminKycQueuePage />} />
                            <Route path="transactions" element={<TransactionsPage />} />
                            <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
                            <Route path="support" element={<AdminSupportTicketsPage />} />
                            <Route path="notifications" element={<AdminNotificationsControlPage />} />
                            <Route path="status" element={<StatusPage />} />
                            
                            {/* Business & Finance */}
                            <Route path="business">
                                <Route path="earnings" element={<AdminEarningsPage />} />
                                {/* Fallback mappings for missing specific analytics views */}
                                <Route path="overview" element={<Navigate to="/admin/business/earnings" replace />} />
                                <Route path="wallet" element={<Navigate to="/admin/business/earnings" replace />} />
                                <Route path="ledger" element={<Navigate to="/admin/business/earnings" replace />} />
                                <Route path="expenses" element={<Navigate to="/admin/business/earnings" replace />} />
                                <Route path="profit" element={<Navigate to="/admin/business/earnings" replace />} />
                            </Route>

                            {/* System */}
                            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                            <Route path="settings" element={<AdminSettingsPage />} />
                        </Route>
                    </Route>

                    {/* ---------- System Routes ---------- */}
                    <Route path="/not-authorized" element={<NotAuthorized />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    );
}
