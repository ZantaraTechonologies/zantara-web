// src/routes/AppRoutes.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Route Guards (eager — needed on every navigation)
import ProtectedRoute from './guards/ProtectedRoute';
import AuthRoute from './guards/AuthRoute';
import AdminProtectedRoute from './guards/AdminProtectedRoute';
import RequireAccess from './guards/RequireAccess';

import { useAuthStore } from '../store/auth/authStore';

// Public Pages
const LandingPage = lazy(() => import('../pages/LandingPage'));
const PrivacyPolicy = lazy(() => import('../pages/system/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('../pages/system/TermsAndConditions'));

// Auth Pages
const UserLoginPage = lazy(() => import('../pages/auth/UserLoginPage'));
const UserRegisterPage = lazy(() => import('../pages/auth/UserRegisterPage'));
const UserOtpPage = lazy(() => import('../pages/auth/UserOtpPage'));
const UserForgotPasswordPage = lazy(() => import('../pages/auth/UserForgotPasswordPage'));

// User Pages
const DashboardLayout = lazy(() => import('../layouts/user/DashboardLayout'));
const UserDashboardPage = lazy(() => import('../pages/user/UserDashboardPage'));
const ServicesPage = lazy(() => import('../pages/user/ServicesPage'));
const UserWalletPage = lazy(() => import('../pages/user/UserWalletPage'));
const UserFundWalletPage = lazy(() => import('../pages/user/UserFundWalletPage'));
const UserWithdrawPage = lazy(() => import('../pages/user/UserWithdrawPage'));
const UserLinkedAccountsPage = lazy(() => import('../pages/user/UserLinkedAccountsPage'));
const UserVirtualAccountPage = lazy(() => import('../pages/user/UserVirtualAccountPage'));
const UserBuyDataPage = lazy(() => import('../pages/user/UserBuyDataPage'));
const UserBuyAirtimePage = lazy(() => import('../pages/user/UserBuyAirtimePage'));
const UserBuyElectricityPage = lazy(() => import('../pages/user/UserBuyElectricityPage'));
const UserBuyCablePage = lazy(() => import('../pages/user/UserBuyCablePage'));
const UserBuyExamPinPage = lazy(() => import('../pages/user/UserBuyExamPinPage'));
const TransactionStatusPage = lazy(() => import('../pages/user/TransactionStatusPage'));
const PaystackReturn = lazy(() => import('../pages/user/PaystackReturn'));
const ReferralProgramPage = lazy(() => import('../pages/user/ReferralProgramPage'));
const ReferralWalletPage = lazy(() => import('../pages/user/ReferralWalletPage'));
const RedeemEarningsPage = lazy(() => import('../pages/user/RedeemEarningsPage'));
const UserProfilePage = lazy(() => import('../pages/user/UserProfilePage'));
const UserPersonalInfoPage = lazy(() => import('../pages/user/UserPersonalInfoPage'));
const UserSecuritySettingsPage = lazy(() => import('../pages/user/UserSecuritySettingsPage'));
const UserPinSetupPage = lazy(() => import('../pages/user/UserPinSetupPage'));
const UserChangePasswordPage = lazy(() => import('../pages/user/UserChangePasswordPage'));
const KYCLevelsPage = lazy(() => import('../pages/user/KYCLevelsPage'));
const KYCUploadPage = lazy(() => import('../pages/user/KYCUploadPage'));
const KYCStatusPage = lazy(() => import('../pages/user/KYCStatusPage'));
const UserTransactionsPage = lazy(() => import('../pages/user/UserTransactionsPage'));
const TransactionDetailsPage = lazy(() => import('../pages/user/TransactionDetailsPage'));
const ReceiptPage = lazy(() => import('../pages/user/ReceiptPage'));
const UserNotificationsPage = lazy(() => import('../pages/user/UserNotificationsPage'));
const SupportCenterPage = lazy(() => import('../pages/user/SupportCenterPage'));
const CreateTicketPage = lazy(() => import('../pages/user/CreateTicketPage'));
const SupportTicketDetailsPage = lazy(() => import('../pages/user/SupportTicketDetailsPage'));
const InvestmentPage = lazy(() => import('../pages/user/InvestmentPage'));
const InvestmentWithdrawPage = lazy(() => import('../pages/user/InvestmentWithdrawPage'));

// Admin Pages
const AdminLayout = lazy(() => import('../layouts/admin/AdminLayout'));
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminRegister = lazy(() => import('../pages/admin/AdminRegister'));
const AdminPinSetupPage = lazy(() => import('../pages/admin/AdminPinSetupPage'));
const StatusPage = lazy(() => import('../pages/admin/StatusPage').then(m => ({ default: m.StatusPage })));
const TransactionsPage = lazy(() => import('../pages/admin/TransactionsPage'));
const AdminTransactionDetailPage = lazy(() => import('../pages/admin/AdminTransactionDetailPage'));
const AdminUserDetailPage = lazy(() => import('../pages/admin/AdminUserDetailPage'));
const AdminWithdrawalsPage = lazy(() => import('../pages/admin/AdminWithdrawalsPage'));
const AdminWithdrawalDetailPage = lazy(() => import('../pages/admin/AdminWithdrawalDetailPage'));
const AdminSupportTicketsPage = lazy(() => import('../pages/admin/AdminSupportTicketsPage'));
const AdminSupportTicketDetailPage = lazy(() => import('../pages/admin/AdminSupportTicketDetailPage'));
const AdminNotificationsControlPage = lazy(() => import('../pages/admin/AdminNotificationsControlPage'));
const AdminFinancialHubPage = lazy(() => import('../pages/admin/finance/hub/AdminFinancialHubPage'));
const AdminSystemWalletPage = lazy(() => import('../pages/admin/finance/AdminSystemWalletPage'));
const AdminCommissionSettingsPage = lazy(() => import('../pages/admin/finance/AdminCommissionSettingsPage'));
const AdminPaymentGatewaysPage = lazy(() => import('../pages/admin/finance/AdminPaymentGatewaysPage'));
const AdminAuditLogsPage = lazy(() => import('../pages/admin/AdminAuditLogsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
const AdminNotificationSettingsPage = lazy(() => import('../pages/admin/AdminNotificationSettingsPage'));
const AdminNotificationDiagnosticsPage = lazy(() => import('../pages/admin/AdminNotificationDiagnosticsPage'));
const AdminShareholdersPage = lazy(() => import('../pages/admin/AdminShareholdersPage'));
const AdminProfilePage = lazy(() => import('../pages/admin/AdminProfilePage'));
const AdminServiceHubPage = lazy(() => import('../pages/admin/catalog/hub/AdminServiceHubPage'));
const AdminPersonnelHubPage = lazy(() => import('../pages/admin/personnel/hub/AdminPersonnelHubPage'));
const AdminKycDetailPage = lazy(() => import('../pages/admin/AdminKycDetailPage'));

// System Pages
const NotFound = lazy(() => import('../pages/system/NotFound'));
const NotAuthorized = lazy(() => import('../pages/system/NotAuthorized'));
const MaintenancePage = lazy(() => import('../pages/system/MaintenancePage'));
const NoInternetPage = lazy(() => import('../pages/system/NoInternetPage'));
const ErrorPage = lazy(() => import('../pages/system/ErrorPage'));

const RouteLoader = () => (
    <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-mint/60 border border-brand-emerald/20 flex items-center justify-center shadow-card">
                <div className="w-6 h-6 border-4 border-brand-emerald/20 border-t-brand-emerald rounded-full animate-spin"></div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading</p>
        </div>
    </div>
);

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
            <Suspense fallback={<RouteLoader />}>
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
                            <Route path="investments" element={<InvestmentPage />} />
                            <Route path="investments/withdraw" element={<InvestmentWithdrawPage />} />

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
                            <Route path="/admin/pin-setup" element={<AdminPinSetupPage />} />
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<AdminDashboardPage />} />
                                <Route path="dashboard" element={<Navigate to="/admin" replace />} />
                                
                                <Route path="users" element={<Navigate to="/admin/personnel/hub" replace />} />
                                <Route path="users/:id" element={<AdminUserDetailPage />} />
                                
                                <Route path="kyc" element={<Navigate to="/admin/personnel/hub" state={{ activeTab: 'verification' }} replace />} />
                                <Route path="kyc/:id" element={<AdminKycDetailPage />} />
                                
                                <Route path="personnel">
                                    <Route path="hub" element={<AdminPersonnelHubPage />} />
                                </Route>
                                <Route path="transactions" element={<TransactionsPage />} />
                                <Route path="transactions/:id" element={<AdminTransactionDetailPage />} />
                                <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
                                <Route path="withdrawals/:id" element={<AdminWithdrawalDetailPage />} />
                                <Route path="support" element={<AdminSupportTicketsPage />} />
                                <Route path="support/:id" element={<AdminSupportTicketDetailPage />} />
                                <Route path="notifications" element={<AdminNotificationsControlPage />} />
                                <Route path="status" element={<StatusPage />} />
                                <Route path="profile" element={<AdminProfilePage />} />
                                
                                {/* Business & Finance — SuperAdmin Only */}
                                <Route element={<RequireAccess anyRole={["superAdmin"]} />}>
                                    <Route path="business">
                                        <Route path="intelligence" element={<AdminFinancialHubPage />} />
                                        <Route path="overview" element={<Navigate to="intelligence" state={{ consolidated: true }} replace />} />
                                        <Route path="wallet" element={<AdminSystemWalletPage />} />
                                        <Route path="treasury" element={<Navigate to="intelligence" state={{ consolidated: true }} replace />} />
                                        <Route path="ledger" element={<Navigate to="intelligence" state={{ consolidated: true }} replace />} />
                                        <Route path="expenses" element={<Navigate to="intelligence" state={{ consolidated: true }} replace />} />
                                        <Route path="profit" element={<Navigate to="intelligence" state={{ consolidated: true }} replace />} />
                                        <Route path="earnings" element={<Navigate to="intelligence" state={{ consolidated: true }} replace />} />
                                        <Route path="commissions" element={<AdminCommissionSettingsPage />} />
                                        <Route path="shareholders" element={<AdminShareholdersPage />} />
                                        <Route path="payment-gateways" element={<AdminPaymentGatewaysPage />} />
                                    </Route>

                                    {/* Aliases for Finance / Settings Payment Gateways navigation */}
                                    <Route path="finance/payment-gateways" element={<Navigate to="/admin/business/payment-gateways" replace />} />
                                    <Route path="settings/payment-gateways" element={<Navigate to="/admin/business/payment-gateways" replace />} />

                                    {/* System — SuperAdmin Only */}
                                    <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                                    <Route path="settings" element={<AdminSettingsPage />} />
                                    <Route path="settings/notifications" element={<AdminNotificationSettingsPage />} />
                                    <Route path="settings/notifications/diagnostics" element={<AdminNotificationDiagnosticsPage />} />
                                    <Route path="providers" element={<Navigate to="/admin/catalog/hub" state={{ activeTab: 'vendors' }} replace />} />
                                    <Route path="services-routing" element={<Navigate to="/admin/catalog/hub" replace />} />
                                    
                                    <Route path="catalog">
                                        <Route path="hub" element={<AdminServiceHubPage />} />
                                    </Route>
                                    
                                    {/* Batch 3: Normalized Hierarchy & Pricing Management */}
                                    <Route path="hierarchy">
                                        <Route path="pricing-rules" element={<Navigate to="/admin/catalog/hub" state={{ activeTab: 'pricing' }} replace />} />
                                        <Route path="provider-offers" element={<Navigate to="/admin/catalog/hub" state={{ activeTab: 'fulfillment' }} replace />} />
                                    </Route>
                                </Route>
                            </Route>
                        </Route>

                        {/* ---------- System Routes ---------- */}
                        <Route path="/not-authorized" element={<NotAuthorized />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    );
}
