import axios from 'axios';

// La URL base del servidor (sin /api)
export const SERVER_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001/api').replace('/api', '');

// La URL base de la API
export const API_BASE_URL = `${SERVER_URL}/api`;

const api = axios.create({
    baseURL: API_BASE_URL
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;