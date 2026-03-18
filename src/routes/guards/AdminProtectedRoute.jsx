import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';

const AdminProtectedRoute = () => {
    const { user, isAuthenticated, loading, isInitialized, fetchMe } = useAuthStore();

    useEffect(() => {
        if (!isInitialized) {
            fetchMe();
        }
    }, [isInitialized, fetchMe]);

    if (loading || !isInitialized) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
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
