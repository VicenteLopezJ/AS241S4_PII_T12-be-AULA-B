// apiClient.js
import axios from 'axios';

// ✅ URL BASE CENTRALIZADA AQUÍ
const API_BASE_URL = 'https://as241s4-pii-t14-be.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores global (Común a todos)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    // Puedes agregar lógica para redireccionar a login, etc.
    return Promise.reject(error);
  }
);

export default api;