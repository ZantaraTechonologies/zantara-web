import { create } from 'zustand';
import * as authService from '../../services/auth/authService';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: !!localStorage.getItem('token'),
    isInitialized: !localStorage.getItem('token'),
    error: null,
    isMaintenanceMode: false,
    isNoInternet: false,
    globalError: null,

    setAuth: (user, token) => {
        const activeToken = token || user?.token || localStorage.getItem('token');
        if (activeToken) {
            localStorage.setItem('token', activeToken);
        }
        set({ user, token: activeToken, isAuthenticated: !!activeToken, loading: false, isInitialized: true, error: null });
    },

    clearAuth: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, loading: false, isInitialized: true, error: null });
    },

    fetchMe: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ loading: false, isInitialized: true, isAuthenticated: false });
            return;
        }

        set({ loading: true });
        try {
            const data = await authService.getMe();
            // Loosening the check: if data exists and looks like a user or has a user field
            const user = data.user || (data.id || data._id ? data : null);
            
            if (user) {
                set({ user, isAuthenticated: true, loading: false, isInitialized: true });
            } else {
                console.warn("fetchMe: No user data returned", data);
                get().clearAuth();
            }
        } catch (error) {
            console.error("fetchMe: Request failed", error);
            get().clearAuth();
        } finally {
            set({ loading: false, isInitialized: true });
        }
    },

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const data = await authService.login(credentials);
            // console.log("login: Response received", data);
            
            const token = data.token || data.accessToken || data.access_token || data.data?.token;
            const user = data.user || data.data?.user || (data.id || data._id ? data : null);

            if (token || user) {
                get().setAuth(user, token);
                return data;
            } else {
                throw new Error(data.message || 'Login failed: No user or token in response');
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Login failed';
            set({ error: msg, loading: false });
            throw error;
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const data = await authService.register(userData);
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
            const msg = error.response?.data?.message || error.message || 'Registration failed';
            set({ error: msg, loading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            get().clearAuth();
        }
    },

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setUser: (user) => set({ user }),
    setMaintenanceMode: (status) => set({ isMaintenanceMode: status }),
    setNoInternet: (status) => set({ isNoInternet: status }),
    setGlobalError: (error) => set({ globalError: error }),
    resetSystemStates: () => set({ isMaintenanceMode: false, isNoInternet: false, globalError: null }),
}));

