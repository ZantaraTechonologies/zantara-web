import axios from 'axios';
import { useAuthStore } from '../../store/auth/authStore.js';

const baseURL = import.meta.env.DEV 
    ? 'http://localhost:8000' 
    : import.meta.env.VITE_API_BASE_URL;

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
