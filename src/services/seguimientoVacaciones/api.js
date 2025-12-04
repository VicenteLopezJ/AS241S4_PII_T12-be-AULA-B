import axios from "axios";
import apiConfig from "./config/api.config";



const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor para agregar el token automáticamente a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('auth_token');

    // Si existe el token, agregarlo al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.MODE === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      if (token) {
        console.log('Token enviado:', token.substring(0, 20) + '...');
      }
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.MODE === 'development') {
      console.log('API Response:', response.status);
    }
    return response;
  },
  (error) => {
    console.log('API Error:', error.response?.data);
    console.log('Status:', error.response?.status);
    console.log('Request:', error.config?.data);

    // Si el error es 401 (no autorizado), redirigir al login
    if (error.response?.status === 401) {
      // Limpiar el token inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_permissions');

      // Recargar la página para mostrar el login
      // Solo si no estamos ya en una ruta de auth
      if (!window.location.pathname.includes('/login')) {
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

export default api;