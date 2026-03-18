import { createBrowserRouter } from "react-router-dom";
import RequireAccess from "./guards/RequireAccess";
import AdminLayout from "../layouts/admin/AdminLayout";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminRegister from "../pages/admin/AdminRegister";
import { StatusPage } from "../pages/admin/StatusPage";
import TransactionsPage from "../pages/admin/TransactionsPage";
import BusinessOverview from "../features/business/pages/BusinessOverview";
import BusinessWallet from "../features/business/pages/BusinessWallet";
import BusinessCostLedger from "../features/business/pages/BusinessCostLedger";
import BusinessExpenses from "../features/business/pages/BusinessExpenses";
import BusinessProfitAnalytics from "../features/business/pages/BusinessProfitAnalytics";
import BusinessSettlement from "../features/business/pages/BusinessSettlement";
import BusinessCashFlow from "../features/business/pages/BusinessCashFlow";
import BusinessRefundsLosses from "../features/business/pages/BusinessRefundsLosses";

export const router = createBrowserRouter([
  // Public admin auth pages
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/register", element: <AdminRegister /> }, // hide behind env flag in prod

  // Protected admin area — any of ["admin","superAdmin"]
  {
    path: "/admin",
    element: <RequireAccess anyRole={["admin","superAdmin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "dashboard", element: <StatusPage /> },      // sample
          { path: "status", element: <StatusPage /> },
          { path: "transactions", element: <TransactionsPage /> },
          { path: "business/overview", element: <BusinessOverview /> },
          { path: "business/wallets", element: <BusinessWallet /> },
          { path: "business/cost-ledger", element: <BusinessCostLedger /> },
          { path: "business/expenses", element: <BusinessExpenses /> },
          { path: "business/profit", element: <BusinessProfitAnalytics /> },
          { path: "business/settlements", element: <BusinessSettlement /> },
          { path: "business/cashflow", element: <BusinessCashFlow /> },
          { path: "business/refunds", element: <BusinessRefundsLosses /> },
        ],
      },
    ],
  },
]);
