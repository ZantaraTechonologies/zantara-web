import axios from 'axios';

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
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // We could also trigger a store clear here, 
            // but removing token ensures subsequent ProtectedRoute checks fail.
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
