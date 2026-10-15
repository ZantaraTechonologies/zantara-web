import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';
import { PageLoader } from '../../components/feedback/Skeletons';
import { getPostLoginPath } from '../../utils/sessionRouteState';
import { resolvePostAuthPath } from '../../utils/onboarding';

const AuthRoute = ({ children }) => {
    const { user, isAuthenticated, isInitialized, fetchMe, onboarding } = useAuthStore();
    const location = useLocation();
    const from = getPostLoginPath(location.state);

    React.useEffect(() => {
        if (!isInitialized || (isAuthenticated && !user)) {
            fetchMe();
        }
    }, [isInitialized, isAuthenticated, user, fetchMe]);

    if (!isInitialized || (isAuthenticated && !user)) {
        return <PageLoader />;
    }
    
    return isAuthenticated ? <Navigate to={resolvePostAuthPath(onboarding, from)} replace /> : children;
};

export default AuthRoute;
