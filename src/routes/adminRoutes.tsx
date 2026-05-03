import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireAccess from "./guards/RequireAccess";
import AdminLayout from "../layouts/admin/AdminLayout";
import AdminLogin from "../pages/admin/AdminLoginPage";
import AdminRegister from "../pages/admin/AdminRegister";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUserDetailPage from "../pages/admin/AdminUserDetailPage";
import AdminPersonnelHubPage from "../pages/admin/personnel/hub/AdminPersonnelHubPage";
import AdminWithdrawalsPage from "../pages/admin/AdminWithdrawalsPage";
import AdminSupportTicketsPage from "../pages/admin/AdminSupportTicketsPage";
import AdminSupportTicketDetailPage from "../pages/admin/AdminSupportTicketDetailPage";
import AdminNotificationsControlPage from "../pages/admin/AdminNotificationsControlPage";
import AdminAuditLogsPage from "../pages/admin/AdminAuditLogsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import { StatusPage } from "../pages/admin/StatusPage";
import TransactionsPage from "../pages/admin/TransactionsPage";
import AdminTransactionDetailPage from "../pages/admin/AdminTransactionDetailPage";
import AdminSystemWalletPage from "../pages/admin/finance/AdminSystemWalletPage";
import AdminCommissionSettingsPage from "../pages/admin/finance/AdminCommissionSettingsPage";
import AdminFinancialHubPage from "../pages/admin/finance/hub/AdminFinancialHubPage";
import AdminKycDetailPage from "../pages/admin/AdminKycDetailPage";

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
          { path: "users", element: <Navigate to="/admin/personnel/hub" replace /> },
          { path: "users/:id", element: <AdminUserDetailPage /> },
          { path: "kyc", element: <Navigate to="/admin/personnel/hub" state={{ activeTab: 'verification' }} replace /> },
          { path: "kyc/:id", element: <AdminKycDetailPage /> },
          { 
            path: "personnel",
            children: [
              { path: "hub", element: <AdminPersonnelHubPage /> }
            ]
          },
          { path: "withdrawals", element: <AdminWithdrawalsPage /> },
          { path: "support", element: <AdminSupportTicketsPage /> },
          { path: "support/:id", element: <AdminSupportTicketDetailPage /> },
          { path: "notifications", element: <AdminNotificationsControlPage /> },
          { path: "audit", element: <AdminAuditLogsPage /> },
          { path: "settings", element: <AdminSettingsPage /> },
          { path: "status", element: <StatusPage /> },
          { path: "transactions", element: <TransactionsPage /> },
          { path: "transactions/:id", element: <AdminTransactionDetailPage /> },
          { path: "business/overview", element: <Navigate to="/admin/business/intelligence" state={{ consolidated: true }} replace /> },
          { path: "business/wallet", element: <AdminSystemWalletPage /> },
          { path: "business/ledger", element: <Navigate to="/admin/business/intelligence" state={{ consolidated: true }} replace /> },
          { path: "business/expenses", element: <Navigate to="/admin/business/intelligence" state={{ consolidated: true }} replace /> },
          { path: "business/profit", element: <Navigate to="/admin/business/intelligence" state={{ consolidated: true }} replace /> },
          { path: "business/treasury", element: <Navigate to="/admin/business/intelligence" state={{ consolidated: true }} replace /> },
          { path: "business/commissions", element: <AdminCommissionSettingsPage /> },
          { path: "business/earnings", element: <Navigate to="/admin/business/intelligence" state={{ consolidated: true }} replace /> },
          { path: "business/intelligence", element: <AdminFinancialHubPage /> },
        ],
      },
    ],
  },
]);
