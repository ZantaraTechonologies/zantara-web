import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';

const AuthRoute = ({ children }) => {
    const { isAuthenticated, loading, isInitialized, fetchMe } = useAuthStore();
    const location = useLocation();
    const from = location.state?.from?.pathname;

    React.useEffect(() => {
        if (!isInitialized) {
            fetchMe();
        }
    }, [isInitialized, fetchMe]);

    if (loading || !isInitialized) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return isAuthenticated ? <Navigate to={from || "/app/wallet"} replace /> : children;
};

export default AuthRoute;
