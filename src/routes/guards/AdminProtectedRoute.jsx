import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';
import { PageLoader } from '../../components/feedback/Skeletons';

const AdminProtectedRoute = () => {
    const { user, isAuthenticated, loading, isInitialized, fetchMe } = useAuthStore();

    useEffect(() => {
        if (!isInitialized) {
            fetchMe();
        }
    }, [isInitialized, fetchMe]);

    if (loading || !isInitialized) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    const roles = Array.isArray(user?.roles) ? user.roles : [];
    const isAdmin = roles.includes('admin') || roles.includes('superAdmin');

    if (!isAdmin) {
        return <Navigate to="/not-authorized" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;
