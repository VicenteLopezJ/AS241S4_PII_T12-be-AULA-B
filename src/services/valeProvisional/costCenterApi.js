// costCenterApi.js
import api from './apiClient'; // 📦 Importamos la instancia centralizada

// ✅ Interceptor para debug de requests (Específico de este archivo - MANTENIDO)
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

// ✅ Interceptor para debug de responses (Específico de este archivo - MANTENIDO)
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

export const CostCenterService = {
  getAll: () => api.get('/costCenter'),
  getById: (id) => api.get(`/costCenter/${id}`),
  getByStatus: (status) => api.get(`/costCenter/status/${status}`),
  create: (data) => api.post('/costCenter/save', data),
  update: (data) => api.put('/costCenter/update', data),
  delete: (id) => api.patch(`/costCenter/delete/${id}`),
  restore: (id) => api.patch(`/costCenter/restore/${id}`),
  getAreas: () => api.get('/area')
};

export default api;