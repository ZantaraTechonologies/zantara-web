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

        if (!error.response && (error.code === 'ECONNABORTED' || error.message === 'Network Error')) {
            setNoInternet(true);
        }

        return Promise.reject(error);
    }
);

export default API;
