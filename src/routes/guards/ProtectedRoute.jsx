import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';

const ProtectedRoute = ({ children }) => {
    const { user, isAuthenticated, loading, fetchMe } = useAuthStore();
    const location = useLocation();

    React.useEffect(() => {
        if (isAuthenticated && !user) {
            fetchMe();
        }
    }, [isAuthenticated, user, fetchMe]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

export default ProtectedRoute;
