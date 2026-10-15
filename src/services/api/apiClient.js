import axios from 'axios';
import { useAuthStore } from '../../store/auth/authStore.js';
import {
    captureSessionRequest,
    getSessionRequestSignal,
    isSessionRequestCurrent,
    reloadForExternalSession
} from '../../app/sessionLifecycle';

// Runtime environment detection
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const configuredBaseURL = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
const baseURL = isLocal ? 'http://localhost:8000' : configuredBaseURL;
if (!baseURL) throw new Error('VITE_API_BASE_URL is required outside local development');

const API = axios.create({
    baseURL: `${baseURL}/api`,
});

API.interceptors.request.use((config) => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const sessionToken = useAuthStore.getState().token;
    const explicitAuthorization = config.headers?.get?.('Authorization')
        || config.headers?.Authorization
        || config.headers?.authorization;
    if (!explicitAuthorization && sessionToken !== storedToken) {
        reloadForExternalSession();
        throw new axios.CanceledError('Session credentials changed');
    }
    const token = sessionToken;
    if (token && !explicitAuthorization) config.headers.Authorization = `Bearer ${token}`;
    const authorization = explicitAuthorization || (token ? `Bearer ${token}` : null);
    const requestToken = typeof authorization === 'string'
        ? authorization.replace(/^Bearer\s+/i, '')
        : token;
    if (requestToken) {
        config.__sessionContext = captureSessionRequest(requestToken);
        if (!config.signal) config.signal = getSessionRequestSignal();
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        const { setMaintenanceMode, setNoInternet } = useAuthStore.getState();
        const requestIsCurrent = isSessionRequestCurrent(error.config?.__sessionContext);

        if (error.response?.status === 401 && requestIsCurrent) {
            useAuthStore.getState().clearAuth();
            window.location.href = '/login';
        }

        if (error.response?.status === 403 && requestIsCurrent) {
            const message = error.response.data?.message;
            const authoritativeOnboarding = error.response.data?.data?.onboarding;
            if (authoritativeOnboarding) {
                useAuthStore.getState().setOnboarding(authoritativeOnboarding);
            }
            if (error.response.data?.code === 'ONBOARDING_INCOMPLETE') {
                if (!authoritativeOnboarding) useAuthStore.getState().setOnboardingFailure(
                    'ONBOARDING_INCOMPLETE',
                    message || 'Complete onboarding before accessing this resource.'
                );
            }
            // If the token is invalid/expired, we should treat it like a 401
            if (message === 'Invalid or expired token') {
                useAuthStore.getState().clearAuth();
                window.location.href = '/login';
            }
        }

        if (
            error.response?.status === 503 &&
            error.response?.data?.code === 'SYSTEM_MAINTENANCE'
        ) {
            setMaintenanceMode(true);
        }

        if (
            error.response?.status === 503 &&
            ['ONBOARDING_STATE_UNAVAILABLE', 'ONBOARDING_DEPENDENCY_UNAVAILABLE', 'ONBOARDING_CONFIGURATION_INVALID'].includes(error.response?.data?.code) &&
            requestIsCurrent
        ) {
            useAuthStore.getState().setOnboardingFailure(
                error.response.data.code,
                error.response.data.message || 'Onboarding is temporarily unavailable.',
                error.response.data?.data?.onboarding || null
            );
        }

        if (error.response?.status === 428 && requestIsCurrent) {
            // Guarded financial/service action blocked pending legal acceptance.
            const { setLegalActionBlocked } = useAuthStore.getState();
            setLegalActionBlocked(true);
        }

        const isTimeout = error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'));
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

        // Only trigger global NoInternetPage on genuine network/offline drop, NEVER on request timeout
        if (!error.response && isOffline && !isTimeout) {
            setNoInternet(true);
        }

        return Promise.reject(error);
    }
);

export default API;
