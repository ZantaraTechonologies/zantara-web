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

    if (!isInitialized) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    const roles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : []);
    const isAdmin = roles.includes('admin') || roles.includes('superAdmin');

    if (!isAdmin) {
        return <Navigate to="/not-authorized" replace />;
    }

    // Enforce transaction PIN (Master Override Code) setup for admins
    const isPinSetupPage = window.location.pathname === '/admin/pin-setup';
    if (user && user.isPinSet === false && !isPinSetupPage) {
        return <Navigate to="/admin/pin-setup" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;
