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
const authResetState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    isInitialized: true,
    error: null,
    legalActionBlocked: false,
};

const identityOf = (user) => user?.id || user?._id || null;

export const useAuthStore = create((set, get) => ({
    user: null,
    token: storedToken,
    isAuthenticated: !!storedToken,
    loading: !!storedToken,
    isInitialized: !storedToken,
    error: null,
    isMaintenanceMode: false,
    isNoInternet: false,
    globalError: null,
    legalActionBlocked: false,

    setAuth: (user, token, rememberMe = true) => {
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
        set({ user, token: activeToken, isAuthenticated: !!activeToken, loading: false, isInitialized: true, error: null });
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
            const user = data.user || (data.id || data._id ? data : null);
            
            if (user) {
                get().setAuth(user, token, localStorage.getItem('token') === token);
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
                get().setAuth(user, token, rememberMe);
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
                get().setAuth(user, token);
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
