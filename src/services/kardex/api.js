import axios from 'axios';

// Configuración base de axios
const API = axios.create({
  baseURL: 'https://symmetrical-spoon-r4w7jggrr754cpp45-5008.app.github.dev/api', 
  headers: {
    'Content-Type': 'application/json',
  },
}); 

// Interceptor para agregar token si existe
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'dummy_token') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;