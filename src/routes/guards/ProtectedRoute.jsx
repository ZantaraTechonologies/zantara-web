import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';
import { PageLoader } from '../../components/feedback/Skeletons';
import { getOnboardingPath, shouldRestrictDashboard } from '../../utils/onboarding';

const ProtectedRoute = ({ children, allowOnboarding = false, allowRecovery = false }) => {
    const { user, isAuthenticated, isInitialized, fetchMe, onboarding, onboardingStatus, refreshOnboarding } = useAuthStore();
    const location = useLocation();

    React.useEffect(() => {
        if (!isInitialized || (isAuthenticated && !user)) {
            fetchMe();
        }
    }, [isInitialized, isAuthenticated, user, fetchMe]);

    React.useEffect(() => {
        if (isAuthenticated && user && !allowRecovery && onboardingStatus === 'idle') {
            refreshOnboarding().catch(() => {});
        }
    }, [allowRecovery, isAuthenticated, onboardingStatus, refreshOnboarding, user]);

    if (!isInitialized || (isAuthenticated && !user)) {
        return <PageLoader />;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowRecovery) return children;

    if (onboardingStatus === 'idle' || (onboardingStatus === 'loading' && !onboarding)) {
        return <PageLoader />;
    }

    if (allowOnboarding) {
        if (onboarding && !onboarding.enforced) return <Navigate to="/app" replace />;
        return children;
    }

    if (shouldRestrictDashboard(onboarding)) {
        return <Navigate to={getOnboardingPath(onboarding)} replace state={{ from: location }} />;
    }

    // Preserve the pre-onboarding PIN rule only for customers the new policy does not enforce.
    const isPinSetupPage = location.pathname === '/app/profile/security/pin';
    if (!onboarding?.enforced && user && user.isPinSet === false && !isPinSetupPage) {
        return <Navigate to="/app/profile/security/pin" replace state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;
