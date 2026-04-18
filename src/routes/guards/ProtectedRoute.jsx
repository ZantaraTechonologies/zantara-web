import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';
import { PageLoader } from '../../components/feedback/Skeletons';

const ProtectedRoute = ({ children }) => {
    const { user, isAuthenticated, loading, isInitialized, fetchMe } = useAuthStore();
    const location = useLocation();

    React.useEffect(() => {
        if (!isInitialized) {
            fetchMe();
        }
    }, [isInitialized, fetchMe]);

    if (!isInitialized) {
        return <PageLoader />;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Enforce transaction PIN setup
    const isPinSetupPage = location.pathname === '/app/profile/security/pin';
    if (user && user.isPinSet === false && !isPinSetupPage) {
        return <Navigate to="/app/profile/security/pin" replace />;
    }

    return children;
};

export default ProtectedRoute;
