import { createBrowserRouter } from "react-router-dom";
import RequireAccess from "./guards/RequireAccess";
import AdminLayout from "../layouts/admin/AdminLayout";
import AdminLogin from "../pages/admin/AdminLoginPage";
import AdminRegister from "../pages/admin/AdminRegister";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminUserDetailPage from "../pages/admin/AdminUserDetailPage";
import AdminKycQueuePage from "../pages/admin/AdminKycQueuePage";
import AdminWithdrawalsPage from "../pages/admin/AdminWithdrawalsPage";
import AdminSupportTicketsPage from "../pages/admin/AdminSupportTicketsPage";
import AdminNotificationsControlPage from "../pages/admin/AdminNotificationsControlPage";
import AdminAuditLogsPage from "../pages/admin/AdminAuditLogsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import { StatusPage } from "../pages/admin/StatusPage";
import TransactionsPage from "../pages/admin/TransactionsPage";
import BusinessOverview from "../features/business/pages/BusinessOverview";
import BusinessWalletPage from "../features/business/pages/BusinessWalletPage";
import BusinessCostLedgerPage from "../features/business/pages/BusinessCostLedgerPage";
import BusinessProfitAnalytics from "../features/business/pages/BusinessProfitAnalytics";
import BusinessSettlement from "../features/business/pages/BusinessSettlement";
import BusinessCashFlow from "../features/business/pages/BusinessCashFlow";
import BusinessRefundsLosses from "../features/business/pages/BusinessRefundsLosses";
import BusinessExpenses from "../features/business/pages/BusinessExpenses";
import AdminEarningsPage from "../pages/admin/AdminEarningsPage";

export const router = createBrowserRouter([
  // Public admin auth pages
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/register", element: <AdminRegister /> }, // hide behind env flag in prod

  // Protected admin area — any of ["admin","superAdmin"]
  {
    path: "/admin",
    element: <RequireAccess anyRole={["admin", "superAdmin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "users/:id", element: <AdminUserDetailPage /> },
          { path: "kyc", element: <AdminKycQueuePage /> },
          { path: "withdrawals", element: <AdminWithdrawalsPage /> },
          { path: "support", element: <AdminSupportTicketsPage /> },
          { path: "notifications", element: <AdminNotificationsControlPage /> },
          { path: "audit", element: <AdminAuditLogsPage /> },
          { path: "settings", element: <AdminSettingsPage /> },
          { path: "status", element: <StatusPage /> },
          { path: "transactions", element: <TransactionsPage /> },
          { path: "business/overview", element: <BusinessOverview /> },
          { path: "business/wallet", element: <BusinessWalletPage /> },
          { path: "business/ledger", element: <BusinessCostLedgerPage /> },
          { path: "business/expenses", element: <BusinessExpenses /> },
          { path: "business/profit", element: <BusinessProfitAnalytics /> },
          { path: "business/settlements", element: <BusinessSettlement /> },
          { path: "business/cashflow", element: <BusinessCashFlow /> },
          { path: "business/refunds", element: <BusinessRefundsLosses /> },
          { path: "business/earnings", element: <AdminEarningsPage /> },
        ],
      },
    ],
  },
]);
