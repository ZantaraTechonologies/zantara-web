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

    return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

export default ProtectedRoute;
