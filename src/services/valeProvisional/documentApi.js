// documentApi.js
import api from './apiClient'; // 📦 Importamos la instancia centralizada

// Interceptor para debug de requests (Específico de este archivo - MANTENIDO)
api.interceptors.request.use(
  (config) => {
    console.log('🚀 REQUEST:', config.method?.toUpperCase(), config.url);
    // Usamos api.defaults.baseURL para obtener la URL base
    console.log('🔧 FULL URL:', api.defaults.baseURL + config.url); 
    return config;
  },
  (error) => {
    console.error('💥 REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Interceptor para debug de responses (Específico de este archivo - MANTENIDO)
api.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('💥 RESPONSE ERROR:', error);
    console.error('📡 ERROR URL:', error.config?.url);
    console.error('🔧 ERROR DETAILS:', error.response);
    return Promise.reject(error);
  }
);

export const DocumentService = {
  // Obtener todos los documentos (con filtro opcional de inactivos)
  getAll: (includeInactive = false) => {
    const url = includeInactive 
      ? '/document?include_inactive=true'
      : '/document';
    return api.get(url);
  },
  
  // Obtener documento por ID
  getById: (id) => api.get(`/document/${id}`),
  
  // Obtener documentos ACTIVOS por tracking_id (para vales)
  getActiveByTracking: (trackingId) => api.get(`/document/tracking/${trackingId}`),
  
  // Obtener historial completo por tracking_id (para auditoría)
  getHistoryByTracking: (trackingId) => api.get(`/document/history/${trackingId}`),
  
  // Crear nuevo documento
  create: (data) => api.post('/document/save', data),
  
  // Actualizar documento existente
  update: (data) => api.put('/document/update', data),
  
  // Eliminar (lógico) - usando PATCH según tu backend
  delete: (id) => api.patch(`/document/delete/${id}`)
};

// Alias para mantener compatibilidad
export const documentService = DocumentService;

export default api;