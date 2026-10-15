import { create } from 'zustand';
import * as authService from '../../services/auth/authService';
import {
    adoptAuthenticatedIdentity,
    beginAuthenticatedSession,
    getSessionEpoch,
    isSessionEpochCurrent,
    registerSessionReset,
    teardownSession
} from '../../app/sessionLifecycle';

const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token') || null;
let onboardingRevision = 0;
const authResetState = {
    user: null,
    token: null,
    onboarding: null,
    onboardingStatus: 'idle',
    onboardingError: null,
    isAuthenticated: false,
    loading: false,
    isInitialized: true,
    error: null,
    legalActionBlocked: false,
};

const identityOf = (user) => user?.id || user?._id || null;

const userFromResponse = (data) => {
    if (data?.user) return data.user;
    if (!data?.id && !data?._id) return null;
    const { onboarding: _onboarding, token: _token, ok: _ok, success: _success, ...user } = data;
    return user;
};

export const useAuthStore = create((set, get) => ({
    user: null,
    token: storedToken,
    onboarding: null,
    onboardingStatus: 'idle',
    onboardingError: null,
    isAuthenticated: !!storedToken,
    loading: !!storedToken,
    isInitialized: !storedToken,
    error: null,
    isMaintenanceMode: false,
    isNoInternet: false,
    globalError: null,
    legalActionBlocked: false,

    setAuth: (user, token, rememberMe = true, onboarding) => {
        const activeToken = token || user?.token || localStorage.getItem('token') || sessionStorage.getItem('token');
        const current = get();
        if (identityOf(current.user) !== identityOf(user) || current.token !== activeToken) {
            if (!current.user && current.token && current.token === activeToken) {
                adoptAuthenticatedIdentity();
            } else {
                beginAuthenticatedSession();
            }
        }
        if (activeToken) {
            if (rememberMe) {
                localStorage.setItem('token', activeToken);
                sessionStorage.removeItem('token');
            } else {
                sessionStorage.setItem('token', activeToken);
                localStorage.removeItem('token');
            }
        }
        onboardingRevision += 1;
        set({
            user,
            token: activeToken,
            isAuthenticated: !!activeToken,
            loading: false,
            isInitialized: true,
            error: null,
            onboarding: onboarding ?? null,
            onboardingStatus: onboarding ? 'ready' : 'idle',
            onboardingError: null,
        });
    },

    hydrateAuthResponse: (data) => {
        if (!data) return;
        const current = get();
        const responseUser = userFromResponse(data);
        const user = responseUser ? { ...current.user, ...responseUser } : current.user;
        const token = data.token || data.accessToken || data.access_token || data.data?.token || current.token;
        const onboarding = data.onboarding || data.data?.onboarding || current.onboarding;
        if (user && token) {
            get().setAuth(user, token, localStorage.getItem('token') === current.token, onboarding);
        } else if (onboarding) {
            onboardingRevision += 1;
            set({ onboarding, onboardingStatus: 'ready', onboardingError: null });
        }
    },

    setOnboarding: (onboarding) => {
        onboardingRevision += 1;
        set({
            onboarding,
            onboardingStatus: onboarding ? 'ready' : 'idle',
            onboardingError: null,
        });
    },

    setOnboardingFailure: (code, message, onboarding = null) => {
        onboardingRevision += 1;
        set((state) => ({
            onboarding: onboarding || (state.onboarding ? {
                ...state.onboarding,
                status: 'unavailable',
                complete: false,
                dashboardAllowed: false,
                code,
            } : null),
            onboardingStatus: 'error',
            onboardingError: { code, message },
        }));
    },

    refreshOnboarding: async (force = false) => {
        if (!get().isAuthenticated) return null;
        if (!force && get().onboardingStatus === 'loading') return get().onboarding;
        const epoch = getSessionEpoch();
        const revision = onboardingRevision;
        set({ onboardingStatus: 'loading', onboardingError: null });
        try {
            const onboarding = await authService.getOnboardingStatus();
            if (!isSessionEpochCurrent(epoch) || revision !== onboardingRevision) return get().onboarding;
            get().setOnboarding(onboarding);
            return onboarding;
        } catch (error) {
            if (!isSessionEpochCurrent(epoch) || revision !== onboardingRevision) return get().onboarding;
            const data = error.response?.data;
            get().setOnboardingFailure(
                data?.code || 'ONBOARDING_STATE_UNAVAILABLE',
                data?.message || 'Unable to determine onboarding status',
                data?.data?.onboarding || null,
            );
            throw error;
        }
    },

    clearAuth: () => {
        teardownSession();
    },

    reset: () => set(authResetState),

    fetchMe: async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            set({ loading: false, isInitialized: true, isAuthenticated: false });
            return;
        }

        set({ loading: true });
        const epoch = getSessionEpoch();
        try {
            const data = await authService.getMe();
            if (!isSessionEpochCurrent(epoch)) return;
            // Loosening the check: if data exists and looks like a user or has a user field
            const user = userFromResponse(data);
            
            if (user) {
                get().setAuth(user, token, localStorage.getItem('token') === token, data.onboarding);
            } else {
                console.warn('fetchMe: No user data returned');
                get().clearAuth();
            }
        } catch {
            if (!isSessionEpochCurrent(epoch)) return;
            console.error('fetchMe: Request failed');
            get().clearAuth();
        } finally {
            if (isSessionEpochCurrent(epoch)) set({ loading: false, isInitialized: true });
        }
    },

    login: async (credentials, rememberMe = false) => {
        set({ loading: true, error: null });
        const epoch = getSessionEpoch();
        try {
            const data = await authService.login({ ...credentials, rememberMe });
            if (!isSessionEpochCurrent(epoch)) throw new Error('Authentication request was superseded');
            
            const token = data.token || data.accessToken || data.access_token || data.data?.token;
            const user = data.user || data.data?.user || (data.id || data._id ? data : null);

            if (token || user) {
                get().setAuth(user, token, rememberMe, data.onboarding || data.data?.onboarding);
                return data;
            } else {
                throw new Error(data.message || 'Login failed: No user or token in response');
            }
        } catch (error) {
            if (!isSessionEpochCurrent(epoch)) throw error;
            const msg = error.response?.data?.message || error.message || 'Login failed';
            set({ error: msg, loading: false });
            throw error;
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        const epoch = getSessionEpoch();
        try {
            const data = await authService.register(userData);
            if (!isSessionEpochCurrent(epoch)) throw new Error('Registration request was superseded');
            // console.log("register: Response received", data);
            
            const token = data.token || data.accessToken || data.access_token || data.data?.token;
            const user = data.user || data.data?.user || (data.id || data._id ? data : null);

            if (token || user) {
                get().setAuth(user, token, true, data.onboarding || data.data?.onboarding);
                return data;
            } else {
                // If the API returns success but no immediate session, that's fine too (e.g. redirect to OTP)
                set({ loading: false });
                return data;
            }
        } catch (error) {
            if (!isSessionEpochCurrent(epoch)) throw error;
            const msg = error.response?.data?.message || error.message || 'Registration failed';
            set({ error: msg, loading: false });
            throw error;
        }
    },

    logout: async () => {
        const token = get().token || localStorage.getItem('token') || sessionStorage.getItem('token');
        get().clearAuth();
        try {
            await authService.logout(token);
        } catch {
            console.error('Logout failed');
        }
    },

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setUser: (user) => set({ user }),
    setMaintenanceMode: (status) => set({ isMaintenanceMode: status }),
    setNoInternet: (status) => set({ isNoInternet: status }),
    setGlobalError: (error) => set({ globalError: error }),
    setLegalActionBlocked: (blocked) => set({ legalActionBlocked: blocked }),
    resetSystemStates: () => set({ isMaintenanceMode: false, isNoInternet: false, globalError: null }),
}));

registerSessionReset('auth', () => useAuthStore.getState().reset());
