import axios from 'axios';
import { getToken, logout } from '../utils/auth';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust if backend runs on a different port
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            toast.error('Session expired. Please login again.');
            logout();
        }
        return Promise.reject(error);
    }
);

export default api;
