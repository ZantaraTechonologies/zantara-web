// src/routes/AppRoutes.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Overview';
import Wallet from '../pages/dashboard/Wallet';
import Transactions from '../pages/dashboard/Transactions';
import NotFound from '../pages/NotFound';
import DahaTechLanding from '../pages/LandingPage';
import PrivacyPolicy from '../components/PrivacyPolicy';
import TermsAndConditions from '../components/TermsAndConditions';

// Layout
import DashboardLayout from '../layouts/DashboardLayout';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AuthRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                
                <Route path="/" element={<DahaTechLanding />} />
                <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                <Route path='/terms-and-conditions' element={<TermsAndConditions />} />

                <Route
                    path="/login"
                    element={
                        <AuthRoute>
                            <Login />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <AuthRoute>
                            <Register />
                        </AuthRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="wallet" element={<Wallet />} />
                    <Route path="transactions" element={<Transactions />} />
                </Route>

                {/* Catch-All */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes