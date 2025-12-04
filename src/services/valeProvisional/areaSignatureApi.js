// areaSignatureApi.js
import api from './apiClient'; // 📦 Importamos la instancia centralizada

// Interceptor para debug de requests (Específico de este archivo - MANTENIDO)
api.interceptors.request.use(
  (config) => {
    console.log(' REQUEST:', config.method?.toUpperCase(), config.url);
    // Usamos api.defaults.baseURL para obtener la URL base
    console.log(' FULL URL:', api.defaults.baseURL + config.url); 
    return config;
  },
  (error) => {
    console.error(' REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Interceptor para debug de responses (Específico de este archivo - MANTENIDO)
api.interceptors.response.use(
  (response) => {
    console.log(' RESPONSE:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error(' RESPONSE ERROR:', error);
    console.error(' ERROR URL:', error.config?.url);
    console.error('🔧 ERROR DETAILS:', error.response);
    return Promise.reject(error);
  }
);

export const AreaSignatureService = {
  // Obtener todas las firmas de área
  getAll: () => api.get('/areaSignature'),
  
  // Obtener firma por ID
  getById: (id) => api.get(`/areaSignature/${id}`),
  
  // Obtener firmas por estado
  getByStatus: (status) => api.get(`/areaSignature/status/${status}`),
  
  // Crear nueva firma de área
  create: (data) => api.post('/areaSignature/save', data),
  
  // Actualizar firma de área
  update: (data) => api.put('/areaSignature/update', data),
  
  // Eliminar (lógico)
  delete: (id) => api.patch(`/areaSignature/delete/${id}`),
  
  // Restaurar
  restore: (id) => api.patch(`/areaSignature/restore/${id}`),
  
  // Método adicional para obtener áreas (para el dropdown)
  getAreas: () => api.get('/area')
};

// Alias para mantener compatibilidad
export const areaSignatureService = AreaSignatureService;

export default api;