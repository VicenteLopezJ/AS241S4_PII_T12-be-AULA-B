import axios from 'axios';

// Helper to create axios instances with the common config + auth interceptor
const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    // 🔥 USAR assistanceToken PARA EL MÓDULO DE ASISTENCIAS
    const token = localStorage.getItem('assistanceToken') || localStorage.getItem('token');
    
    if (token && token !== 'dummy_token') {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 API Request con token:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ API Request SIN TOKEN');
    }
    
    return config;
  });

  return instance;
};

// --- Export only the 11 module APIs requested ---
export const LAB_API = createInstance(import.meta.env.VITE_LAB_API_URL || 'http://localhost:5011');
export const VIATICOS_API = createInstance(import.meta.env.VITE_VIATICOS_API_URL || 'https://as241s4-pii-t02-be.onrender.com');
export const HACKATHON_API = createInstance(import.meta.env.VITE_HACKATHON_API_URL || 'https://as241s4-pii-t04-be.onrender.com/api');
export const VACACIONES_API = createInstance(import.meta.env.VITE_VACACIONES_API_URL || 'http://localhost:5014');
export const INASISTENCIAS_API = createInstance(import.meta.env.VITE_INASISTENCIAS_API_URL || 'https://as241s4-pii-t12-be-1.onrender.com');
export const VALE_API = createInstance(import.meta.env.VITE_VALE_API_URL || 'http://localhost:5016');
export const PERMISOS_API = createInstance(import.meta.env.VITE_PERMISOS_API_URL || 'http://localhost:5017');
export const KARDEX_API = createInstance(import.meta.env.VITE_KARDEX_API_URL || 'http://localhost:5018');
export const DECLARACION_API = createInstance(import.meta.env.VITE_DECLARACION_API_URL || 'http://localhost:5019');
export const FONDOS_API = createInstance(import.meta.env.VITE_FONDOS_API_URL || 'http://localhost:5020');
export const INTRANET_VVG_API = createInstance(import.meta.env.VITE_INTRANET_VVG_API_URL || 'https://as241s4-pii-team2-back.onrender.com');

const APIS = {
  LAB_API,
  VIATICOS_API,
  HACKATHON_API,
  VACACIONES_API,
  INASISTENCIAS_API,
  VALE_API,
  PERMISOS_API,
  KARDEX_API,
  DECLARACION_API,
  FONDOS_API,
  INTRANET_VVG_API,
};

export default APIS;