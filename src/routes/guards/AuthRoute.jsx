import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const from = location.state?.from?.pathname;
    
    return isAuthenticated ? <Navigate to={from || "/app/wallet"} replace /> : children;
};

export default AuthRoute;
