import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';
import { PageLoader } from '../../components/feedback/Skeletons';

const AuthRoute = ({ children }) => {
    const { isAuthenticated, loading, isInitialized, fetchMe } = useAuthStore();
    const location = useLocation();
    const from = location.state?.from?.pathname;

    React.useEffect(() => {
        if (!isInitialized) {
            fetchMe();
        }
    }, [isInitialized, fetchMe]);

    if (!isInitialized) {
        return <PageLoader />;
    }
    
    return isAuthenticated ? <Navigate to={from || "/app/wallet"} replace /> : children;
};

export default AuthRoute;
