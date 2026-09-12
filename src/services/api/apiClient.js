import axios from 'axios';
import { useAuthStore } from '../../store/auth/authStore.js';

// Runtime environment detection
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseURL = isLocal ? 'http://localhost:8000' : import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
    baseURL: `${baseURL}/api`,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        const { setMaintenanceMode, setNoInternet } = useAuthStore.getState();

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        if (error.response?.status === 403) {
            const message = error.response.data?.message;
            // If the token is invalid/expired, we should treat it like a 401
            if (message === 'Invalid or expired token') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }

        if (error.response?.status === 503) {
            setMaintenanceMode(true);
        }

        if (error.response?.status === 428) {
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
