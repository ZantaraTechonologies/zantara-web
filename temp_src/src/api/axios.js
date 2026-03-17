import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.CLIENT_URL || 'https://vtu-backend-xdmg.onrender.com/api/auth',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default API;
