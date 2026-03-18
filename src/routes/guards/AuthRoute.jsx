import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';

const AuthRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();
    const from = location.state?.from?.pathname;
    
    return isAuthenticated ? <Navigate to={from || "/app/wallet"} replace /> : children;
};

export default AuthRoute;
