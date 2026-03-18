import { create } from 'zustand';
import * as authService from '../../services/auth/authService';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: !!localStorage.getItem('token'),
    isInitialized: !localStorage.getItem('token'),
    error: null,

    setAuth: (user, token) => {
        if (token) localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true, loading: false, isInitialized: true, error: null });
    },

    clearAuth: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, loading: false, isInitialized: true, error: null });
    },

    fetchMe: async () => {
        set({ loading: true });
        try {
            const data = await authService.getMe();
            if (data.ok && data.user) {
                set({ user: data.user, isAuthenticated: true, loading: false, isInitialized: true });
            } else {
                get().clearAuth();
            }
        } catch (error) {
            get().clearAuth();
        } finally {
            set({ loading: false, isInitialized: true });
        }
    },

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const data = await authService.login(credentials);
            if (data.token || data.user || data.ok) {
                const { user, token } = data;
                get().setAuth(user, token);
                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Login failed';
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
}));

