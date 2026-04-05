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
import AdminSupportTicketDetailPage from "../pages/admin/AdminSupportTicketDetailPage";
import AdminNotificationsControlPage from "../pages/admin/AdminNotificationsControlPage";
import AdminAuditLogsPage from "../pages/admin/AdminAuditLogsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import { StatusPage } from "../pages/admin/StatusPage";
import TransactionsPage from "../pages/admin/TransactionsPage";
import AdminTransactionDetailPage from "../pages/admin/AdminTransactionDetailPage";
import AdminBusinessOverviewPage from "../pages/admin/finance/AdminBusinessOverviewPage";
import AdminSystemWalletPage from "../pages/admin/finance/AdminSystemWalletPage";
import AdminBusinessLedgerPage from "../pages/admin/finance/AdminBusinessLedgerPage";
import AdminProfitAnalyticsPage from "../pages/admin/finance/AdminProfitAnalyticsPage";
import AdminExpensesPage from "../pages/admin/finance/AdminExpensesPage";
import AdminCommissionSettingsPage from "../pages/admin/finance/AdminCommissionSettingsPage";
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
          { path: "support/:id", element: <AdminSupportTicketDetailPage /> },
          { path: "notifications", element: <AdminNotificationsControlPage /> },
          { path: "audit", element: <AdminAuditLogsPage /> },
          { path: "settings", element: <AdminSettingsPage /> },
          { path: "status", element: <StatusPage /> },
          { path: "transactions", element: <TransactionsPage /> },
          { path: "transactions/:id", element: <AdminTransactionDetailPage /> },
          { path: "business/overview", element: <AdminBusinessOverviewPage /> },
          { path: "business/wallet", element: <AdminSystemWalletPage /> },
          { path: "business/ledger", element: <AdminBusinessLedgerPage /> },
          { path: "business/expenses", element: <AdminExpensesPage /> },
          { path: "business/profit", element: <AdminProfitAnalyticsPage /> },
          { path: "business/commissions", element: <AdminCommissionSettingsPage /> },
          { path: "business/earnings", element: <AdminEarningsPage /> },
        ],
      },
    ],
  },
]);
