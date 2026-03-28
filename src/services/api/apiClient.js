import axios from 'axios';
import { useAuthStore } from '../../store/auth/authStore.js';

const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
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
